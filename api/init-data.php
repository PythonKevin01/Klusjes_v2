<?php
require_once 'db.php';

try {
    // Clear existing data
    $pdo->exec("DELETE FROM task_photos");
    $pdo->exec("DELETE FROM tasks");
    $pdo->exec("DELETE FROM rooms");
    
    // Sample rooms
    $rooms = [
        ['id' => 'room_1', 'name' => 'Woonkamer', 'description' => 'Gezellige ruimte om te ontspannen', 'color' => '#6366f1'],
        ['id' => 'room_2', 'name' => 'Keuken', 'description' => 'Hart van het huis', 'color' => '#10b981'],
        ['id' => 'room_3', 'name' => 'Slaapkamer', 'description' => 'Rustige plek om uit te rusten', 'color' => '#8b5cf6'],
        ['id' => 'room_4', 'name' => 'Badkamer', 'description' => 'Voor persoonlijke verzorging', 'color' => '#f59e0b'],
        ['id' => 'room_5', 'name' => 'Kantoor', 'description' => 'Productieve werkruimte', 'color' => '#ef4444'],
        ['id' => 'room_6', 'name' => 'Tuin', 'description' => 'Groene buitenruimte', 'color' => '#22c55e'],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO rooms (id, name, description, color) VALUES (?, ?, ?, ?)");
    foreach ($rooms as $room) {
        $stmt->execute([$room['id'], $room['name'], $room['description'], $room['color']]);
    }
    
    // Sample tasks
    $tasks = [
        [
            'id' => 'task_1',
            'room_id' => 'room_1',
            'title' => 'Stofzuigen',
            'description' => 'Hele woonkamer stofzuigen, ook onder de bank',
            'priority' => 0,
            'status' => 'todo',
            'estimated_minutes' => 30
        ],
        [
            'id' => 'task_2',
            'room_id' => 'room_2',
            'title' => 'Afwas doen',
            'description' => 'Alle vuile vaat opruimen',
            'priority' => 1,
            'status' => 'in-progress',
            'estimated_minutes' => 15
        ],
        [
            'id' => 'task_3',
            'room_id' => 'room_3',
            'title' => 'Bed opmaken',
            'description' => 'Lakens verschonen en bed netjes maken',
            'priority' => 0,
            'status' => 'completed',
            'estimated_minutes' => 5,
            'completed_at' => date('Y-m-d H:i:s')
        ],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO tasks (id, room_id, title, description, priority, status, estimated_minutes, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($tasks as $task) {
        $stmt->execute([
            $task['id'],
            $task['room_id'],
            $task['title'],
            $task['description'],
            $task['priority'],
            $task['status'],
            $task['estimated_minutes'],
            $task['completed_at'] ?? null
        ]);
    }
    
    sendJson([
        'status' => 'success',
        'message' => 'Sample data initialized',
        'rooms_created' => count($rooms),
        'tasks_created' => count($tasks)
    ]);
    
} catch (\PDOException $e) {
    sendJson([
        'status' => 'error',
        'message' => $e->getMessage()
    ], 500);
}
?> 