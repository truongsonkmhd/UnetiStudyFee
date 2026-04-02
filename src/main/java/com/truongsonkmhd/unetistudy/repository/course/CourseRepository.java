package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.common.CourseStatus;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseQuickSearchResponse;
import com.truongsonkmhd.unetistudy.model.course.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

  List<Course> findByStatus(CourseStatus status);

  boolean existsBySlug(String slug);

  Optional<Course> findBySlug(String slug);

  // ========== OFFSET PAGINATION ==========

  @Query(value = """
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse(
              c.courseId,
              c.title,
              c.slug, 
              c.shortDescription, 
              c.imageUrl, 
              c.isPublished, 
              CAST(size(c.modules) AS Integer), 
              c.publishedAt, 
              c.enrolledCount, 
              c.capacity, 
              c.instructor.fullName
          )
          from Course c
          where c.isPublished = true
          order by
              case when c.publishedAt is null then 1 else 0 end asc,
              c.publishedAt desc,
              c.courseId desc
      """, countQuery = """
          select count(c)
          from Course c
          where c.isPublished = true
      """)
  Page<CourseCardResponse> findPublishedCourseCards(Pageable pageable);

  @Query(value = """
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse(
              c.courseId,
              c.title, c.slug, c.shortDescription, c.imageUrl, c.isPublished, CAST(size(c.modules) AS Integer), c.publishedAt, c.enrolledCount, c.capacity, c.instructor.fullName
          )
          from Course c
          where c.isPublished = true
            and (cast(:q as string) is null or (
                 lower(c.title) like lower(concat('%', cast(:q as string), '%'))
              or lower(c.slug)  like lower(concat('%', cast(:q as string), '%'))
            ))
            and (cast(:category as string) is null or c.category = :category)
          order by
              case when c.publishedAt is null then 1 else 0 end asc,
              c.publishedAt desc,
              c.courseId desc
      """, countQuery = """
          select count(c)
          from Course c
          where c.isPublished = true
            and (cast(:q as string) is null or (
                 lower(c.title) like lower(concat('%', cast(:q as string), '%'))
              or lower(c.slug)  like lower(concat('%', cast(:q as string), '%'))
            ))
            and (cast(:category as string) is null or c.category = :category)
      """)
  Page<CourseCardResponse> findPublishedCourseCardsWithFilters(
      @Param("q") String q,
      @Param("category") String category,
      Pageable pageable);

  // ========== CURSOR PAGINATION ==========

  @Query("""
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse(
              c.courseId, c.title, c.slug, c.shortDescription, c.imageUrl, c.isPublished, CAST(size(c.modules) AS Integer), c.publishedAt, c.enrolledCount, c.capacity, c.instructor.fullName
          )
          from Course c
          where c.isPublished = true
            and (
              (:publishedAt is not null and (
                c.publishedAt < :publishedAt
                or (c.publishedAt = :publishedAt and c.courseId < :lastId)
                or c.publishedAt is null
              ))
              or (:publishedAt is null and (
                c.publishedAt is null and c.courseId < :lastId
              ))
            )
          order by
              case when c.publishedAt is null then 1 else 0 end asc,
              c.publishedAt desc,
              c.courseId desc
      """)
  Page<CourseCardResponse> findPublishedCourseCardsAfterCursor(
      @Param("publishedAt") LocalDateTime publishedAt,
      @Param("lastId") UUID lastId,
      Pageable pageable);

  @Query(value = """
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse(
              c.courseId,
              c.title,
              c.slug,
              c.shortDescription,
              c.imageUrl,
              c.isPublished,
              CAST(size(c.modules) AS Integer),
              c.publishedAt,
              c.enrolledCount,
              c.capacity,
              c.instructor.fullName
          )
          from Course c
          where (cast(:q as string) is null or lower(c.title) like lower(concat('%', cast(:q as string), '%'))
                 or lower(c.slug) like lower(concat('%', cast(:q as string), '%')))
            and (cast(:status as string) is null or c.status = :status)
            and (cast(:category as string) is null or c.category = :category)
            and (cast(:instructorId as string) is null or c.instructor.id = cast(:instructorId as uuid))
          order by c.createdAt desc
      """)
  Page<CourseCardResponse> findCourseCardsWithFilters(
      @Param("q") String q,
      @Param("status") CourseStatus status,
      @Param("category") String category,
      @Param("instructorId") UUID instructorId,
      Pageable pageable);

  @Query("""
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse(
              c.courseId, c.title, c.slug, c.shortDescription, c.imageUrl, c.isPublished, CAST(size(c.modules) AS Integer), c.publishedAt, c.enrolledCount, c.capacity, c.instructor.fullName
          )
          from Course c
          where c.isPublished = true
            and (
                 lower(c.title) like lower(concat('%', cast(:q as string), '%'))
              or lower(c.slug)  like lower(concat('%', cast(:q as string), '%'))
            )
            and (
              (:publishedAt is not null and (
                c.publishedAt < :publishedAt
                or (c.publishedAt = :publishedAt and c.courseId < :lastId)
                or c.publishedAt is null
              ))
              or (:publishedAt is null and (
                c.publishedAt is null and c.courseId < :lastId
              ))
            )
          order by
              case when c.publishedAt is null then 1 else 0 end asc,
              c.publishedAt desc,
              c.courseId desc
      """)
  Page<CourseCardResponse> searchPublishedCourseCardsAfterCursor(
      @Param("q") String q,
      @Param("publishedAt") LocalDateTime publishedAt,
      @Param("lastId") UUID lastId,
      Pageable pageable);
  @Query("""
          select new com.truongsonkmhd.unetistudy.dto.course_dto.CourseQuickSearchResponse(
              c.courseId, c.title, c.slug, c.imageUrl, c.shortDescription
          )
          from Course c
          where (lower(c.title) like lower(concat('%', cast(:q as string), '%'))
                 or lower(c.slug) like lower(concat('%', cast(:q as string), '%')))
            and (:isPublished is null or c.isPublished = :isPublished)
            and (cast(:category as string) is null or c.category = :category)
          order by c.createdAt desc
      """)
  List<CourseQuickSearchResponse> instantSearch(
      @Param("q") String q,
      @Param("isPublished") Boolean isPublished,
      @Param("category") String category,
      Pageable pageable);
}
