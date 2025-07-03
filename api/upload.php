<?php
require_once 'db.php';

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// Check if file was uploaded
if (empty($_FILES['file'])) {
    sendJson(['error' => 'No file uploaded'], 400);
}

// Check for upload errors
if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    sendJson(['error' => 'Upload failed'], 400);
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $_FILES['file']['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendJson(['error' => 'Invalid file type. Only JPEG, PNG and WebP allowed'], 400);
}

// Get task ID
$taskId = $_POST['taskId'] ?? '';
if (empty($taskId)) {
    sendJson(['error' => 'Task ID is required'], 400);
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/../public/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

try {
    // Load the image
    $tmpPath = $_FILES['file']['tmp_name'];
    
    switch ($mimeType) {
        case 'image/jpeg':
        case 'image/jpg':
            $image = imagecreatefromjpeg($tmpPath);
            break;
        case 'image/png':
            $image = imagecreatefrompng($tmpPath);
            break;
        case 'image/webp':
            $image = imagecreatefromwebp($tmpPath);
            break;
    }
    
    if (!$image) {
        sendJson(['error' => 'Failed to process image'], 500);
    }
    
    // Get original dimensions
    $origWidth = imagesx($image);
    $origHeight = imagesy($image);
    
    // Calculate new dimensions (max 800px wide/tall)
    $maxDim = 800;
    if ($origWidth > $maxDim || $origHeight > $maxDim) {
        $scale = min($maxDim / $origWidth, $maxDim / $origHeight);
        $newWidth = round($origWidth * $scale);
        $newHeight = round($origHeight * $scale);
        
        // Resize image
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
        imagedestroy($image);
        $image = $resized;
    }
    
    // Compress to JPEG with decreasing quality until under 100KB
    $quality = 85;
    $maxSize = 100 * 1024; // 100KB
    $imageData = '';
    
    do {
        ob_start();
        imagejpeg($image, null, $quality);
        $imageData = ob_get_clean();
        $quality -= 5;
    } while (strlen($imageData) > $maxSize && $quality > 10);
    
    // Generate unique filename
    $photoId = uniqid('photo_', true);
    $filename = $taskId . '_' . $photoId . '.jpg';
    $filePath = $uploadDir . $filename;
    
    // Save the compressed image
    file_put_contents($filePath, $imageData);
    
    // Clean up
    imagedestroy($image);
    
    // Save to database
    $stmt = $pdo->prepare("INSERT INTO task_photos (id, task_id, url) VALUES (?, ?, ?)");
    $stmt->execute([
        $photoId,
        $taskId,
        '/public/uploads/' . $filename
    ]);
    
    sendJson([
        'id' => $photoId,
        'url' => '/public/uploads/' . $filename,
        'size' => strlen($imageData)
    ], 201);
    
} catch (Exception $e) {
    sendJson(['error' => 'Failed to process upload: ' . $e->getMessage()], 500);
}
?> 