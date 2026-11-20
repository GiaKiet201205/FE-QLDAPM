import { Link } from 'react-router-dom';
import { coursePrice } from '../../data/userCourses';
import { courseEntry, courseImage } from '../../data/storefront';

export function CourseArtwork({ course, large = false }) {
  return <img className={large ? 'gk-course-image gk-course-image-large' : 'gk-course-image'} src={courseImage(course)} alt={`Không gian học tập dành cho khóa ${course.title}`} loading="lazy" />;
}
export default function CourseCard({ course, owned = false }) {
  return <article className="gk-course-card">
    <Link to={`/courses/${course.id}`} aria-label={`Xem ${course.title}`}><CourseArtwork course={course} /></Link>
    <div className="gk-course-body"><span className="gk-badge">{course.category}</span><h3><Link to={`/courses/${course.id}`}>{course.title}</Link></h3>
      <p>{courseEntry(course)}</p><p>Tại trung tâm · {course.lessons} buổi · {course.duration}</p>
      <small>Học phí từ</small><strong className="gk-price">{coursePrice(course.price)}</strong>
      <Link className="gk-button gk-button-wide" to={owned ? `/user/profile?course=${course.id}` : `/courses/${course.id}`}>{owned ? 'Xem khóa học đã đăng ký' : 'Xem chi tiết'}</Link>
    </div>
  </article>;
}
