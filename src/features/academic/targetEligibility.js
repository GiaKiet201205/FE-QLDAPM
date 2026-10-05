export const targetTypeLabels = {
  RL: "Reading & Listening",
  SW: "Speaking & Writing",
};

const courseLabels = {
  "course-ielts": "IELTS",
  "course-toeic": "TOEIC",
  "course-sat": "SAT",
  "course-toefl": "TOEFL iBT",
};

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

  const courseLabel = courseLabels[classItem.courseId] ?? classItem.courseId;

  // A target from another course can never be reused for this class.
  // Example: TOEIC RL/SW targets do not make a student eligible for IELTS.
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

  // Do not silently treat a class without a target threshold as unrestricted.
  // The class target model must be configured before target-based placement.
  if (!requirements.length) {
    return {
      eligible: false,
      code: "CLASS_TARGET_NOT_CONFIGURED",
      reasons: [
        `Target requirements for ${classItem.classCode} have not been configured yet.`,
      ],
      checks: [],
    };
  }

  const checks = requirements.map((requirement) => {
    const targetValue = getTargetValue(
      studentTargets,
      student.id,
      classItem.courseId,
      requirement.targetType,
    );

    if (targetValue == null) {
      return {
        targetType: requirement.targetType,
        targetValue: null,
        requiredTarget: requirement.requiredTarget,
        eligible: false,
        reason: `${targetTypeLabels[requirement.targetType] ?? requirement.targetType} target is not configured for ${courseLabel}.`,
      };
    }

    if (Number(targetValue) < Number(requirement.requiredTarget)) {
      return {
        targetType: requirement.targetType,
        targetValue,
        requiredTarget: requirement.requiredTarget,
        eligible: false,
        reason: `${targetTypeLabels[requirement.targetType] ?? requirement.targetType} target ${targetValue} is below the class requirement ${requirement.requiredTarget}.`,
      };
    }

    return {
      targetType: requirement.targetType,
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
