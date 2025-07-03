<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'DELETE':
        // Delete photo
        $data = getJsonBody();
        
        if (empty($data['id'])) {
            sendJson(['error' => 'Photo ID is required'], 400);
        }

        try {
            // Get photo info first
            $stmt = $pdo->prepare("SELECT url FROM task_photos WHERE id = ?");
            $stmt->execute([$data['id']]);
            $photo = $stmt->fetch();
            
            if (!$photo) {
                sendJson(['error' => 'Photo not found'], 404);
            }
            
            // Delete from database
            $stmt = $pdo->prepare("DELETE FROM task_photos WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            // Delete file from disk
            $filePath = __DIR__ . '/../' . $photo['url'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            sendJson(['success' => true]);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to delete photo'], 500);
        }
        break;

    case 'GET':
        // Get photos for a task
        if (empty($_GET['task_id'])) {
            sendJson(['error' => 'Task ID is required'], 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT id, url, created_at FROM task_photos WHERE task_id = ? ORDER BY created_at DESC");
            $stmt->execute([$_GET['task_id']]);
            $photos = $stmt->fetchAll();
            
            sendJson($photos);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to fetch photos'], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?> 