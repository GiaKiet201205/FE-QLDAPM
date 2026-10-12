import MyScheduleView from "../features/scheduling/MyScheduleView";

export default function MySchedule({ roleKey }) {
  return <MyScheduleView key={roleKey} roleKey={roleKey} />;
}
