export const assignableClassStatuses = ["DRAFT", "READY", "RUNNING"];

export const courseTargetDefinitions = {
  "course-toeic": {
    courseLabel: "TOEIC",
    scaleNote: "ETS L&R total; S&W is a derived combined target from two 0–200 section scores",
    targets: [
      {
        type: "LR_TOTAL",
        label: "Listening & Reading total",
        min: 10,
        max: 990,
        step: 5,
      },
      {
        type: "SW_TOTAL",
        label: "Speaking & Writing combined",
        min: 0,
        max: 400,
        step: 10,
      },
    ],
  },
  "course-ielts": {
    courseLabel: "IELTS",
    scaleNote: "Overall band score",
    targets: [
      {
        type: "OVERALL_BAND",
        label: "Overall band",
        min: 0,
        max: 9,
        step: 0.5,
      },
    ],
  },
  "course-sat": {
    courseLabel: "SAT",
    scaleNote: "Total score",
    targets: [
      {
        type: "TOTAL",
        label: "Total score",
        min: 400,
        max: 1600,
        step: 10,
      },
    ],
  },
  "course-toefl": {
    courseLabel: "TOEFL iBT",
    scaleNote: "Current 1–6 overall scale",
    targets: [
      {
        type: "OVERALL_1_6",
        label: "Overall score",
        min: 1,
        max: 6,
        step: 0.5,
      },
    ],
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

function isProvided(value) {
  return value !== "" && value != null;
}

function isStepAligned(value, min, step) {
  if (!step) return true;
  const offset = (Number(value) - Number(min)) / Number(step);
  return Math.abs(offset - Math.round(offset)) < 1e-9;
}

export function validateCourseTargetValues(
  courseId,
  values = {},
  { required = false } = {},
) {
  const definition = getCourseTargetDefinition(courseId);
  if (!definition) {
    return {
      ok: false,
      reason: "Target rules for this course are not configured.",
    };
  }

  const providedTargets = definition.targets.filter((target) =>
    isProvided(values?.[target.type]),
  );

  if (!required && providedTargets.length === 0) {
    return { ok: true };
  }

  if (providedTargets.length !== definition.targets.length) {
    return {
      ok: false,
      reason: `Configure all ${definition.courseLabel} target fields or leave the entire course target blank.`,
    };
  }

  for (const target of definition.targets) {
    const raw = values[target.type];
    const value = Number(raw);

    if (!Number.isFinite(value)) {
      return {
        ok: false,
        reason: `${definition.courseLabel} ${target.label} must be a valid number.`,
      };
    }

    if (value < target.min || value > target.max) {
      return {
        ok: false,
        reason: `${definition.courseLabel} ${target.label} must be between ${target.min} and ${target.max}.`,
      };
    }

    if (!isStepAligned(value, target.min, target.step)) {
      return {
        ok: false,
        reason: `${definition.courseLabel} ${target.label} must use increments of ${target.step}.`,
      };
    }
  }

  return { ok: true };
}

export function validateStudentTargets(targets = {}) {
  for (const courseId of Object.keys(targets)) {
    if (!getCourseTargetDefinition(courseId)) {
      return {
        ok: false,
        reason: "Student target contains an unsupported course.",
      };
    }

    const validation = validateCourseTargetValues(courseId, targets[courseId], {
      required: false,
    });
    if (!validation.ok) return validation;
  }

  return { ok: true };
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

  if (!assignableClassStatuses.includes(classItem.status)) {
    return {
      eligible: false,
      code: "CLASS_NOT_ACCEPTING_STUDENTS",
      reasons: [
        `${classItem.classCode} is ${classItem.status}. Students can only be added while a class is Draft, Ready or Running.`,
      ],
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

  const studentTargetObject = Object.fromEntries(
    studentCourseTargets.map((target) => [target.targetType, target.targetValue]),
  );
  const studentValidation = validateCourseTargetValues(
    classItem.courseId,
    studentTargetObject,
    { required: true },
  );
  if (!studentValidation.ok) {
    return {
      eligible: false,
      code: "COURSE_TARGET_INVALID",
      reasons: [studentValidation.reason],
      checks: [],
    };
  }

  const requirements = classTargetRequirements.filter(
    (requirement) => requirement.classId === classItem.id,
  );
  const requirementObject = Object.fromEntries(
    requirements.map((requirement) => [
      requirement.targetType,
      requirement.requiredTarget,
    ]),
  );
  const requirementValidation = validateCourseTargetValues(
    classItem.courseId,
    requirementObject,
    { required: true },
  );

  if (!requirementValidation.ok) {
    return {
      eligible: false,
      code: "CLASS_TARGET_NOT_CONFIGURED",
      reasons: [
        `Target requirements for ${classItem.classCode} are invalid or incomplete. ${requirementValidation.reason}`,
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
