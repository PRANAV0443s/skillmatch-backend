package com.skillmatch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Send a 6-digit OTP to the given email address.
     * If mail is not configured, logs the OTP to the console instead.
     */
    public void sendOtpEmail(String toEmail, String otp, String userName) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("⚠ Mail not configured. OTP for {} is: {}", toEmail, otp);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SkillMatch – Verify Your Email");
            message.setText(
                "Hi " + userName + ",\n\n" +
                "Welcome to SkillMatch! Your verification code is:\n\n" +
                "    " + otp + "\n\n" +
                "This code expires in 10 minutes.\n\n" +
                "If you didn't create this account, please ignore this email.\n\n" +
                "– The SkillMatch Team"
            );

            mailSender.send(message);
            log.info("✔ OTP email sent to {}", toEmail);
            log.info("🔑 [DEBUG] OTP for {} is: {}", toEmail, otp);
        } catch (Exception e) {
            log.error("✘ Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            log.warn("⚠ Fallback – OTP for {} is: {}", toEmail, otp);
        }
    }

    /**
     * Send a simple "Job Application Confirmation" email.
     * Subject: "Job Application Confirmation"
     * Body: "You have successfully applied for the job. Our team will contact you soon."
     */
    public void sendJobApplicationEmail(String toEmail, String userName,
                                         String jobTitle, String company) {
        String body =
            "Hi " + userName + ",\n\n" +
            "You have successfully applied for the job.\n" +
            "Our team will contact you soon.\n\n" +
            "  📋 Position: " + jobTitle + "\n" +
            "  🏢 Company:  " + company + "\n\n" +
            "– The SkillMatch Team";

        if (fromEmail == null || fromEmail.isBlank()) {
            log.info("📧 [MAIL NOT CONFIGURED] Job Application Confirmation for {}:\n{}", toEmail, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Job Application Confirmation");
            message.setText(body);

            mailSender.send(message);
            log.info("✔ Job application confirmation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("✘ Failed to send job application email to {}: {}", toEmail, e.getMessage());
            log.info("📧 [AUTH FAILED - FALLBACK] Job Application Confirmation for {}:\n{}", toEmail, body);
        }
    }

    /**
     * Send a confirmation email when a student applies for a job.
     */
    public void sendApplicationConfirmation(String toEmail, String userName,
                                             String jobTitle, String company,
                                             String location, int matchScore) {
        String emoji = matchScore >= 70 ? "🟢" : matchScore >= 40 ? "🟡" : "🔴";
        String body =
            "Hi " + userName + ",\n\n" +
            "Your application has been submitted successfully! 🎉\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "  Job Details\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "  📋 Position:  " + jobTitle + "\n" +
            "  🏢 Company:   " + company + "\n" +
            "  📍 Location:  " + location + "\n" +
            "  " + emoji + " Match Score: " + matchScore + "%\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "Our AI analyzed your resume against the job requirements and " +
            "calculated a match score of " + matchScore + "%. " +
            (matchScore >= 70
                ? "This is a strong match – great job!"
                : matchScore >= 40
                    ? "You have a decent match. Consider improving skills that align with the role."
                    : "Consider upskilling in the required areas to improve your chances.") +
            "\n\n" +
            "The recruiter will review your application and you'll receive\n" +
            "updates on your SkillMatch dashboard.\n\n" +
            "Good luck! 🚀\n\n" +
            "– The SkillMatch Team";

        if (fromEmail == null || fromEmail.isBlank()) {
            log.info("📧 [MAIL NOT CONFIGURED] Application Confirmation for {}:\n{}", toEmail, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SkillMatch – Application Submitted: " + jobTitle + " at " + company);
            message.setText(body);

            mailSender.send(message);
            log.info("✔ Application confirmation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("✘ Failed to send confirmation email to {}: {}", toEmail, e.getMessage());
            log.info("📧 [AUTH FAILED - FALLBACK] Application Confirmation for {}:\n{}", toEmail, body);
        }
    }

    /**
     * Send a status update email when application status changes
     * (VIEWED, SHORTLISTED, REJECTED).
     */
    public void sendStatusUpdateEmail(String toEmail, String userName,
                                       String jobTitle, String company,
                                       String newStatus) {
        String statusEmoji;
        String statusMessage;
        switch (newStatus.toUpperCase()) {
            case "VIEWED":
                statusEmoji = "👀";
                statusMessage = "The recruiter has viewed your application.";
                break;
            case "SHORTLISTED":
                statusEmoji = "🎉";
                statusMessage = "Congratulations! You've been shortlisted for this position!";
                break;
            case "REJECTED":
                statusEmoji = "😔";
                statusMessage = "Unfortunately, your application was not selected this time. Keep applying!";
                break;
            default:
                statusEmoji = "📋";
                statusMessage = "Your application status has been updated to: " + newStatus;
        }

        String body =
            "Hi " + userName + ",\n\n" +
            statusEmoji + " Application Status Update\n\n" +
            "  📋 Position: " + jobTitle + "\n" +
            "  🏢 Company:  " + company + "\n" +
            "  📊 Status:   " + newStatus + "\n\n" +
            statusMessage + "\n\n" +
            "Check your SkillMatch dashboard for more details.\n\n" +
            "– The SkillMatch Team";

        if (fromEmail == null || fromEmail.isBlank()) {
            log.info("📧 [MAIL NOT CONFIGURED] Status Update for {}:\n{}", toEmail, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SkillMatch – " + statusEmoji + " " + jobTitle + " at " + company + " – " + newStatus);
            message.setText(body);

            mailSender.send(message);
            log.info("✔ Status update email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("✘ Failed to send status email to {}: {}", toEmail, e.getMessage());
            log.info("📧 [AUTH FAILED - FALLBACK] Status Update for {}:\n{}", toEmail, body);
        }
    }
}
