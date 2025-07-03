<?php
require_once 'db.php';

// Set SSE headers
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Cache-Control');

// Prevent timeout
set_time_limit(0);
ini_set('max_execution_time', 0);

// Function to send SSE message
function sendSSE($id, $data, $event = null) {
    if ($event) {
        echo "event: $event\n";
    }
    echo "id: $id\n";
    echo "data: " . json_encode($data) . "\n\n";
    
    // Flush output immediately
    if (ob_get_level()) {
        ob_end_flush();
    }
    flush();
}

// Keep track of last update timestamps
$lastRoomUpdate = 0;
$lastTaskUpdate = 0;
$eventId = 0;

// Send initial connection message
sendSSE($eventId++, [
    'type' => 'connected',
    'message' => 'SSE connection established',
    'timestamp' => time()
], 'connect');

// Main SSE loop
while (true) {
    try {
        // Check for room updates
        $stmt = $pdo->query("SELECT MAX(UNIX_TIMESTAMP(created_at)) as last_update FROM rooms");
        $roomResult = $stmt->fetch();
        $currentRoomUpdate = $roomResult['last_update'] ?? 0;
        
        if ($currentRoomUpdate > $lastRoomUpdate) {
            // Rooms have been updated, send new data
            $stmt = $pdo->query("SELECT * FROM rooms ORDER BY created_at DESC");
            $rooms = $stmt->fetchAll();
            
            sendSSE($eventId++, [
                'type' => 'rooms_updated',
                'rooms' => $rooms,
                'timestamp' => time()
            ], 'rooms');
            
            $lastRoomUpdate = $currentRoomUpdate;
        }
        
        // Check for task updates
        $stmt = $pdo->query("SELECT MAX(UNIX_TIMESTAMP(GREATEST(created_at, COALESCE(completed_at, created_at)))) as last_update FROM tasks");
        $taskResult = $stmt->fetch();
        $currentTaskUpdate = $taskResult['last_update'] ?? 0;
        
        if ($currentTaskUpdate > $lastTaskUpdate) {
            // Tasks have been updated, send new data
            $stmt = $pdo->query("
                SELECT t.*, 
                       GROUP_CONCAT(
                           JSON_OBJECT('id', p.id, 'url', p.url, 'created_at', p.created_at)
                       ) as photos_json
                FROM tasks t 
                LEFT JOIN task_photos p ON t.id = p.task_id 
                GROUP BY t.id 
                ORDER BY t.created_at DESC
            ");
            $tasks = $stmt->fetchAll();
            
            // Parse photos JSON for each task
            foreach ($tasks as &$task) {
                if ($task['photos_json']) {
                    $task['photos'] = json_decode('[' . $task['photos_json'] . ']', true);
                } else {
                    $task['photos'] = [];
                }
                unset($task['photos_json']);
            }
            
            sendSSE($eventId++, [
                'type' => 'tasks_updated', 
                'tasks' => $tasks,
                'timestamp' => time()
            ], 'tasks');
            
            $lastTaskUpdate = $currentTaskUpdate;
        }
        
        // Send heartbeat every 30 seconds
        if ($eventId % 30 === 0) {
            sendSSE($eventId++, [
                'type' => 'heartbeat',
                'timestamp' => time()
            ], 'heartbeat');
        }
        
        // Sleep for 1 second before next check
        sleep(1);
        
    } catch (Exception $e) {
        sendSSE($eventId++, [
            'type' => 'error',
            'message' => $e->getMessage(),
            'timestamp' => time()
        ], 'error');
        break;
    }
    
    // Check if client disconnected
    if (connection_aborted()) {
        break;
    }
}
?> 