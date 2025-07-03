<?php
require_once 'db.php';

// Test database connection and tables
try {
    // Check if connection works
    $stmt = $pdo->query("SELECT 1");
    $result = $stmt->fetch();
    
    // Get table info
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        
        // Get table structure
        $structStmt = $pdo->query("DESCRIBE $tableName");
        $structure = $structStmt->fetchAll();
        
        // Count rows
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $tableName");
        $count = $countStmt->fetch()['count'];
        
        $tables[$tableName] = [
            'structure' => $structure,
            'row_count' => $count
        ];
    }
    
    sendJson([
        'status' => 'success',
        'message' => 'Database connection successful',
        'tables' => $tables,
        'php_version' => phpversion(),
        'pdo_drivers' => PDO::getAvailableDrivers()
    ]);
    
} catch (\PDOException $e) {
    sendJson([
        'status' => 'error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], 500);
}
?> 