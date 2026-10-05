export const targetTypeLabels = {
  RL: "Reading & Listening",
  SW: "Speaking & Writing",
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

  const requirements = classTargetRequirements.filter(
    (requirement) => requirement.classId === classItem.id,
  );

  if (!requirements.length) {
    return {
      eligible: true,
      code: "NO_TARGET_RESTRICTION",
      reasons: [],
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
        reason: `${targetTypeLabels[requirement.targetType] ?? requirement.targetType} target is not configured for this course.`,
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
