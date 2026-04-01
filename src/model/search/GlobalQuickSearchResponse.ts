import { CourseQuickSearchResponse } from "../course-admin/CourseQuickSearchResponse";
import { ClassQuickSearchResponse } from "./ClassQuickSearchResponse";

export interface GlobalQuickSearchResponse {
    courses: CourseQuickSearchResponse[];
    classes: ClassQuickSearchResponse[];
}
