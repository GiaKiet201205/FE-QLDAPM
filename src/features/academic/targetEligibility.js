export const courseTargetDefinitions = {
  "course-toeic": {
    courseLabel: "TOEIC",
    targets: [
      { type: "RL", label: "Reading & Listening" },
      { type: "SW", label: "Speaking & Writing" },
    ],
  },
  "course-ielts": {
    courseLabel: "IELTS",
    targets: [{ type: "TARGET", label: "Target score" }],
  },
  "course-sat": {
    courseLabel: "SAT",
    targets: [{ type: "TARGET", label: "Target score" }],
  },
  "course-toefl": {
    courseLabel: "TOEFL iBT",
    targets: [{ type: "TARGET", label: "Target score" }],
  },
};

export const targetTypeLabels = Object.values(courseTargetDefinitions)
  .flatMap((definition) => definition.targets)
  .reduce(
    (labels, target) => ({
      ...labels,
      [target.type]: target.label,
    }),
    {},
  );

export function getCourseTargetDefinition(courseId) {
  return courseTargetDefinitions[courseId] ?? null;
}

export function getTargetValue(studentTargets, studentId, courseId, targetType) {
  return studentTargets.find(
    (target) =>
      target.studentId === studentId &&
      target.courseId === courseId &&
      target.targetType === targetType,
  )?.targetValue;
}

export function evaluateStudentClassTarget({
  student,
  classItem,
  studentTargets,
  classTargetRequirements,
}) {
  if (!student || !classItem) {
    return {
      eligible: false,
      code: "INVALID_INPUT",
      reasons: ["Student or class was not found."],
      checks: [],
    };
  }

  if (student.status !== "Active") {
    return {
      eligible: false,
      code: "STUDENT_NOT_ACTIVE",
      reasons: [
        `${student.fullName} is currently ${student.status}. Only active students can be added to a class.`,
      ],
      checks: [],
    };
  }

  const definition = getCourseTargetDefinition(classItem.courseId);
  const courseLabel = definition?.courseLabel ?? classItem.courseId;

  if (!definition) {
    return {
      eligible: false,
      code: "COURSE_TARGET_MODEL_MISSING",
      reasons: [
        `Target rules for ${courseLabel} have not been configured in the system.`,
      ],
      checks: [],
    };
  }

  const studentCourseTargets = studentTargets.filter(
    (target) =>
      target.studentId === student.id &&
      target.courseId === classItem.courseId,
  );

  if (!studentCourseTargets.length) {
    return {
      eligible: false,
      code: "COURSE_TARGET_MISSING",
      reasons: [
        `${student.fullName} does not have a target configured for ${courseLabel}.`,
      ],
      checks: [],
    };
  }

  const requirements = classTargetRequirements.filter(
    (requirement) => requirement.classId === classItem.id,
  );

  const missingRequirementTypes = definition.targets
    .map((target) => target.type)
    .filter(
      (targetType) =>
        !requirements.some(
          (requirement) => requirement.targetType === targetType,
        ),
    );

  if (!requirements.length || missingRequirementTypes.length) {
    return {
      eligible: false,
      code: "CLASS_TARGET_NOT_CONFIGURED",
      reasons: [
        `Target requirements for ${classItem.classCode} are incomplete. Configure all ${courseLabel} target requirements before assigning students.`,
      ],
      checks: [],
    };
  }

  const checks = definition.targets.map((targetDefinition) => {
    const requirement = requirements.find(
      (item) => item.targetType === targetDefinition.type,
    );
    const targetValue = getTargetValue(
      studentTargets,
      student.id,
      classItem.courseId,
      targetDefinition.type,
    );

    if (targetValue == null) {
      return {
        targetType: targetDefinition.type,
        targetLabel: targetDefinition.label,
        targetValue: null,
        requiredTarget: requirement.requiredTarget,
        eligible: false,
        reason: `${targetDefinition.label} is not configured for ${courseLabel}.`,
      };
    }

    if (Number(targetValue) < Number(requirement.requiredTarget)) {
      return {
        targetType: targetDefinition.type,
        targetLabel: targetDefinition.label,
        targetValue,
        requiredTarget: requirement.requiredTarget,
        eligible: false,
        reason: `${targetDefinition.label} ${targetValue} is below the class requirement ${requirement.requiredTarget}.`,
      };
    }

    return {
      targetType: targetDefinition.type,
      targetLabel: targetDefinition.label,
      targetValue,
      requiredTarget: requirement.requiredTarget,
      eligible: true,
      reason: "",
    };
  });

  const failed = checks.filter((check) => !check.eligible);

  return {
    eligible: failed.length === 0,
    code: failed.length ? "TARGET_MISMATCH" : "ELIGIBLE",
    reasons: failed.map((check) => check.reason),
    checks,
  };
}
