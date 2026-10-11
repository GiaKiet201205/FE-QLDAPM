import StaffAssignmentView from "../features/scheduling/StaffAssignmentView";

export default function StaffAssignment({ staffRole }) {
  return <StaffAssignmentView key={staffRole} staffRole={staffRole} />;
}
