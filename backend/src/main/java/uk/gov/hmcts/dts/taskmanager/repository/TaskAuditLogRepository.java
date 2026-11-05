package uk.gov.hmcts.dts.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.gov.hmcts.dts.taskmanager.entity.TaskAuditLog;

import java.util.List;

@Repository
public interface TaskAuditLogRepository extends JpaRepository<TaskAuditLog, Long> {

    List<TaskAuditLog> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}

