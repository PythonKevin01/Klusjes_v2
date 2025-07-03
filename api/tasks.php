<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get tasks with optional room filter
        try {
            if (!empty($_GET['room_id'])) {
                $stmt = $pdo->prepare("SELECT * FROM tasks WHERE room_id = ? ORDER BY priority DESC, created_at ASC");
                $stmt->execute([$_GET['room_id']]);
            } else {
                $stmt = $pdo->query("SELECT * FROM tasks ORDER BY priority DESC, created_at ASC");
            }
            $tasks = $stmt->fetchAll();
            
            // Convert date strings to ISO format and add photos
            foreach ($tasks as &$task) {
                $task['priority'] = (bool)$task['priority'];
                $task['estimatedDuration'] = $task['estimated_minutes'];
                unset($task['estimated_minutes']);
                
                // Get photos for each task
                $photoStmt = $pdo->prepare("SELECT id, url, created_at FROM task_photos WHERE task_id = ? ORDER BY created_at DESC");
                $photoStmt->execute([$task['id']]);
                $task['photos'] = $photoStmt->fetchAll();
            }
            
            sendJson($tasks);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to fetch tasks'], 500);
        }
        break;

    case 'POST':
        // Create new task
        $data = getJsonBody();
        
        if (empty($data['title']) || empty($data['roomId'])) {
            sendJson(['error' => 'Title and roomId are required'], 400);
        }

        try {
            $id = uniqid('task_', true);
            $stmt = $pdo->prepare("INSERT INTO tasks (id, room_id, title, description, priority, status, due_date, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['roomId'],
                $data['title'],
                $data['description'] ?? '',
                $data['priority'] ? 1 : 0,
                $data['status'] ?? 'todo',
                $data['dueDate'] ?? null,
                $data['estimatedDuration'] ?? null
            ]);
            
            // Return the created task
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $task = $stmt->fetch();
            $task['priority'] = (bool)$task['priority'];
            $task['estimatedDuration'] = $task['estimated_minutes'];
            unset($task['estimated_minutes']);
            $task['photos'] = []; // New task has no photos
            
            sendJson($task, 201);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to create task'], 500);
        }
        break;

    case 'PUT':
        // Update task
        $data = getJsonBody();
        
        if (empty($data['id'])) {
            sendJson(['error' => 'ID is required'], 400);
        }

        try {
            // Handle status change and completed_at
            $completedAt = null;
            if (!empty($data['status']) && $data['status'] === 'completed') {
                $completedAt = date('Y-m-d H:i:s');
            }

            $stmt = $pdo->prepare("UPDATE tasks SET 
                title = ?, 
                description = ?, 
                priority = ?, 
                status = ?, 
                due_date = ?, 
                estimated_minutes = ?,
                completed_at = ?
                WHERE id = ?");
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $data['priority'] ? 1 : 0,
                $data['status'] ?? 'todo',
                $data['dueDate'] ?? null,
                $data['estimatedDuration'] ?? null,
                $completedAt,
                $data['id']
            ]);
            
            sendJson(['success' => true]);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to update task'], 500);
        }
        break;

    case 'DELETE':
        // Delete task
        $data = getJsonBody();
        
        if (empty($data['id'])) {
            sendJson(['error' => 'ID is required'], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            sendJson(['success' => true]);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to delete task'], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?> 