package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.context.UserContext;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionShowDTO;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;

import com.truongsonkmhd.unetistudy.service.CodingSubmissionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/practice/lesson")
@Slf4j(topic = "PRACTICE-LESSON-CONTROLLER")
@Tag(name = "practice lesson controller")
@RequiredArgsConstructor
public class CodingExerciseController {

    private final CodingSubmissionService codingSubmissionService;

    @GetMapping("/submissions/{slug}")
    public ResponseEntity<IResponseMessage> showExerciseSubmissions(@PathVariable("slug") String theSlug) {
        List<CodingSubmissionShowDTO> submissions = codingSubmissionService
                .getCodingSubmissionShowByUserName(UserContext.getUsername(), theSlug);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(submissions));
    }

    @GetMapping("/leaderboard/{slug}")
    public ResponseEntity<IResponseMessage> showLeaderBoard(@PathVariable("slug") String theSlug) {
        List<CodingSubmissionShowDTO> submissions = codingSubmissionService
                .getCodingSubmissionShowBySlugExercise(theSlug);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(submissions));
    }

    @GetMapping("/tutorial/{slug}")
    public String showTutorial(@PathVariable("slug") String theSlug) {
        return "ClientTemplates/coding-exercise/tutorial";
    }

}
