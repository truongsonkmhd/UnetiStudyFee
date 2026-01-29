# 🧹 Clean Code Implementation Plan - UnetiStudyBee

## Mục tiêu
Refactor toàn bộ dự án theo nguyên tắc **SOLID** và **Clean Code** để cải thiện:
- Khả năng bảo trì (Maintainability)
- Khả năng mở rộng (Extensibility)
- Khả năng đọc hiểu (Readability)
- Khả năng test (Testability)

---

## 📊 Tổng quan dự án

| Module | Số file | Mô tả |
|--------|---------|-------|
| common | 13 | Enums và constants |
| configuration | 14 | Cấu hình Spring |
| controller | 20 | REST Controllers |
| dto | 78 | Data Transfer Objects |
| exception | 15 | Exception handling |
| mapper | 21 | Entity <-> DTO mappers |
| model | 41 | JPA Entities |
| repository | 30 | Spring Data Repositories |
| service | 46 | Business logic |
| validator | 8 | Custom validators |
| security | 6 | Security components |

---

## 🔴 PHASE 1: Sửa lỗi cơ bản (Priority: HIGH)

### 1.1 Sửa typo trong tên thư mục/package ❌ KHÔNG CẦN (đã sửa)
-  ✅ Đã được sửa
- `cutom_exeption` → `custom_exception` (vẫn còn)

**Tác động**: Thay đổi package name trong ~15 files
**Thời gian ước tính**: 30 phút

### 1.2 Xóa code thừa / commented code
- Loại bỏ các method bị comment không cần thiết
- Xóa imports không sử dụng

**Files cần sửa**:
- `QuizTemplateServiceImpl.java` (lines 99-105, 177-184)
- `CodingExerciseTemplateController.java` (đã comment method updateStatus)
- Nhiều controllers khác

**Thời gian ước tính**: 1 giờ

---

## 🟠 PHASE 2: Single Responsibility Principle (SRP)

### 2.1 Tách PageResponse Builder thành Utility
**Vấn đề**: Logic xây dựng PageResponse được lặp lại trong nhiều service

**Giải pháp**: Tạo `PageResponseBuilder` utility class

```java
// utils/PageResponseBuilder.java
public final class PageResponseBuilder {
    public static <T> PageResponse<T> build(Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .build();
    }
}
```

**Files bị ảnh hưởng**: 
- `QuizTemplateServiceImpl.java`
- `CodingExerciseTemplateService.java`
- Các service khác có pagination

### 2.2 Tách Validation Logic
**Vấn đề**: Logic validation nằm rải rác trong service

**Giải pháp**: Tạo các Validator classes riêng biệt

```java
// validator/QuizTemplateValidator.java
@Component
public class QuizTemplateValidator {
    public void validateForCreate(QuizTemplateDTO.CreateRequest request) {}
    public void validateForUpdate(QuizTemplate template, QuizTemplateDTO.UpdateRequest request) {}
    public void validateVersion(QuizTemplate template, Long providedVersion) {}
}
```

### 2.3 Tách Sort/Filter Logic
**Vấn đề**: Logic sort trong UserServiceImpl quá phức tạp (regex parsing)

**Giải pháp**: Tạo `SortBuilder` utility

```java
// utils/SortBuilder.java
public final class SortBuilder {
    public static List<Sort.Order> parse(String sortBy) {}
    public static List<Sort.Order> parse(List<String> sorts) {}
}
```

---

## 🟡 PHASE 3: Open/Closed Principle (OCP)

### 3.1 Refactor Response Message Factory
**Vấn đề**: `SuccessResponseMessage` có nhiều static methods tương tự

**Giải pháp**: Sử dụng Factory Pattern với enum

```java
public enum ResponseType {
    CREATED("Resource created successfully"),
    UPDATED("Resource updated successfully"),
    DELETED("Resource deleted successfully"),
    LOADED("Resource loaded successfully"),
    PROCESSED("Operation processed successfully");
    
    private final String message;
    
    public static ResponseMessage success(ResponseType type, Object data) {
        return ResponseMessage.builder()
                .status(true)
                .statusCode(200)
                .data(data)
                .message(type.getMessage())
                .build();
    }
}
```

### 3.2 Tạo Base Service Abstract Class
**Giải pháp**: Tạo abstract class cho các CRUD operations phổ biến

```java
public abstract class BaseCrudService<E, ID, CreateDTO, UpdateDTO, ResponseDTO> {
    protected abstract JpaRepository<E, ID> getRepository();
    protected abstract ResponseDTO toResponse(E entity);
    protected abstract E toEntity(CreateDTO dto);
    
    public ResponseDTO findById(ID id) {}
    public void deleteById(ID id) {}
    // ...
}
```

---

## 🟢 PHASE 4: Interface Segregation Principle (ISP)

### 4.1 Refactor IResponseMessage Interface
**Vấn đề**: Interface hiện tại có thiết kế kém (chứa constants thay vì methods)

```java
// Hiện tại - BAD
public interface IResponseMessage {
    boolean status = true;  // Đây là constant, không phải method!
    int statusCode = 200;
    String message = "";
    Object data = new Object();
}
```

**Giải pháp**:
```java
// NEW - GOOD
public interface ApiResponse {
    boolean isSuccess();
    int getStatusCode();
    String getMessage();
    Object getData();
}
```

### 4.2 Tách Repository Interfaces
**Vấn đề**: Một số repository có quá nhiều custom methods

**Giải pháp**: Sử dụng Specification pattern hoặc tách interface

```java
// QuizTemplateRepository extends JpaRepository + custom interface
public interface QuizTemplateCustomRepository {
    Page<QuizTemplate> searchTemplates(QuizTemplateSearchCriteria criteria, Pageable pageable);
}
```

---

## 🔵 PHASE 5: Dependency Inversion Principle (DIP)

### 5.1 Inject Interfaces thay vì Implementations
**Kiểm tra**: Đảm bảo tất cả injection đều là interface

### 5.2 Tạo Search Criteria Classes
**Giải pháp**: Dùng Criteria pattern cho complex queries

```java
@Value
@Builder
public class QuizTemplateSearchCriteria {
    String category;
    Boolean isActive;
    String searchTerm;
    int page;
    int size;
}
```

---

## 🟣 PHASE 6: Clean Code Practices

### 6.1 Naming Conventions
| Hiện tại | Đề xuất |
|----------|---------|
| `findTemplateOrThrow` | `findTemplateById` (exception handling implicit) |
| `cutom_exeption` | `custom_exception` |
| `getUserEntity` | `findUserById` |
| `req` | `request` |
| `qt` | `questionTemplate` |
| `at` | `answerTemplate` |

### 6.2 Magic Numbers/Strings → Constants
```java
// constants/PaginationConstants.java
public final class PaginationConstants {
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int MIN_PAGE = 0;
}

// constants/ValidationMessages.java
public final class ValidationMessages {
    public static final String TEMPLATE_NOT_FOUND = "Quiz template not found with ID: %s";
    public static final String TEMPLATE_INACTIVE = "Cannot create quiz from inactive template";
}
```

### 6.3 Method Length & Complexity
**Vấn đề**: `searchTemplates` method trong `QuizTemplateServiceImpl` quá dài (~50 lines)

**Giải pháp**: Tách thành private helper methods
```java
public PageResponse<QuizTemplateDTO.Response> searchTemplates() {
    SearchParams params = normalizeSearchParams(page, size, category, searchTerm);
    Page<QuizTemplate> results = executeSearch(params, isActive);
    return buildPageResponse(results);
}
```

### 6.4 Consistent Exception Handling
**Tạo factory method cho exceptions**:
```java
// exception/Exceptions.java
public final class Exceptions {
    public static ResourceNotFoundException templateNotFound(UUID id) {
        return new ResourceNotFoundException("QuizTemplate", id);
    }
    
    public static BusinessRuleException templateInactive(UUID id) {
        return new BusinessRuleException("Template " + id + " is inactive");
    }
}
```

---

## 📁 PHASE 7: Package Restructuring

### Đề xuất cấu trúc mới:
```
com.truongsonkmhd.unetistudy/
├── core/
│   ├── common/           # Enums, Constants
│   ├── config/           # Configurations
│   ├── exception/
│   │   ├── custom/       # Custom exceptions (sửa từ cutom_exeption)
│   │   └── handler/      # Exception handlers
│   ├── security/
│   └── util/             # Utilities
├── domain/
│   ├── quiz/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── controller/
│   │   ├── dto/
│   │   └── mapper/
│   ├── course/
│   ├── user/
│   ├── coding/
│   └── message/
└── infrastructure/
    ├── persistence/
    └── messaging/
```

**Lưu ý**: Package restructuring là thay đổi lớn, cần cân nhắc kỹ

---

## ⏱️ Timeline ước tính

| Phase | Thời gian | Độ ưu tiên |
|-------|-----------|------------|
| Phase 1 | 1-2 giờ | 🔴 Cao |
| Phase 2 | 3-4 giờ | 🟠 Trung bình-Cao |
| Phase 3 | 2-3 giờ | 🟡 Trung bình |
| Phase 4 | 2-3 giờ | 🟢 Trung bình |
| Phase 5 | 1-2 giờ | 🔵 Thấp-Trung bình |
| Phase 6 | 3-4 giờ | 🟣 Cao (Clean Code) |
| Phase 7 | 4-6 giờ | ⚪ Tùy chọn |

**Tổng cộng**: ~16-24 giờ làm việc

---

## ✅ Checklist thực hiện

### Phase 1
- [x] Rename package `cutom_exeption` → `custom_exception` ✅
- [x] Sửa tên class `ForBiddenException` → `ForbiddenException` ✅
- [x] Xóa commented code không cần thiết ✅
- [x] Xóa unused imports (một số file chính) ✅
- [x] Sửa ambiguous repository imports ✅

### Phase 2
- [x] Tạo `PageResponseBuilder` utility ✅
- [x] Tạo `SortBuilder` utility ✅
- [x] Tách validation logic cho QuizTemplate ✅
- [x] Refactor các service (User, QuizTemplate, CodingExerciseTemplate) ✅

### Phase 3
- [x] Refactor `ResponseMessage` factory (merging `SuccessResponse` logic) ✅
- [x] Tạo BaseCrudService abstract class ✅
- [x] Cập nhật tất cả Controllers sử dụng standards mới ✅
- [x] Xử lý build warnings (Builder defaults, unused imports) ✅

### Phase 4
- [ ] Refactor `IResponseMessage` interface
- [ ] Áp dụng Specification pattern cho complex queries

### Phase 5
- [ ] Review tất cả dependency injection
- [ ] Tạo SearchCriteria classes

### Phase 6
- [ ] Apply naming conventions
- [ ] Extract constants
- [ ] Refactor long methods
- [ ] Consistent exception handling

### Phase 7
- [ ] (Optional) Package restructuring

---

## 📝 Ghi chú

1. **Backup**: Đảm bảo có backup/commit trước mỗi phase
2. **Testing**: Chạy tests sau mỗi thay đổi
3. **Incremental**: Thực hiện từng bước nhỏ, verify rồi mới tiếp tục
4. **Communication**: Xác nhận với team trước các thay đổi lớn

---

*Tạo ngày: 2026-01-26*
*Cập nhật lần cuối: 2026-01-26*
