<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all rooms
        try {
            $stmt = $pdo->query("SELECT * FROM rooms ORDER BY created_at ASC");
            $rooms = $stmt->fetchAll();
            sendJson($rooms);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to fetch rooms'], 500);
        }
        break;

    case 'POST':
        // Create new room
        $data = getJsonBody();
        
        if (empty($data['name'])) {
            sendJson(['error' => 'Name is required'], 400);
        }

        try {
            $id = uniqid('room_', true);
            $stmt = $pdo->prepare("INSERT INTO rooms (id, name, description, color) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['name'],
                $data['description'] ?? '',
                $data['color'] ?? '#6366f1'
            ]);
            
            // Return the created room
            $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
            $stmt->execute([$id]);
            $room = $stmt->fetch();
            
            sendJson($room, 201);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to create room'], 500);
        }
        break;

    case 'PUT':
        // Update room
        $data = getJsonBody();
        
        if (empty($data['id'])) {
            sendJson(['error' => 'ID is required'], 400);
        }

        try {
            $stmt = $pdo->prepare("UPDATE rooms SET name = ?, description = ?, color = ? WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['color'] ?? '#6366f1',
                $data['id']
            ]);
            
            sendJson(['success' => true]);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to update room'], 500);
        }
        break;

    case 'DELETE':
        // Delete room
        $data = getJsonBody();
        
        if (empty($data['id'])) {
            sendJson(['error' => 'ID is required'], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            sendJson(['success' => true]);
        } catch (\PDOException $e) {
            sendJson(['error' => 'Failed to delete room'], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?> 