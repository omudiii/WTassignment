<?php
/**
 * Database Management using JSON File Storage
 * No external dependencies required - stores bills in JSON file
 */

$dbFile = __DIR__ . '/bills_data.json';
$db = null;

// Initialize database file if it doesn't exist
function initializeDatabase() {
    global $dbFile;
    if (!file_exists($dbFile)) {
        $initialData = [
            'bills' => [],
            'bill_breakdown' => []
        ];
        file_put_contents($dbFile, json_encode($initialData, JSON_PRETTY_PRINT));
    }
}

// Read database
function readDatabase() {
    global $dbFile;
    if (file_exists($dbFile)) {
        $content = file_get_contents($dbFile);
        return json_decode($content, true) ?? ['bills' => [], 'bill_breakdown' => []];
    }
    return ['bills' => [], 'bill_breakdown' => []];
}

// Write database
function writeDatabase($data) {
    global $dbFile;
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// Save a bill to database
function saveBill($db, $name, $consumer_id, $area, $city, $units, $bill, $breakdown) {
    try {
        $data = readDatabase();
        
        $billId = (count($data['bills']) > 0) ? max(array_column($data['bills'], 'id')) + 1 : 1;
        $today = date('Y-m-01'); // First day of current month
        
        $billRecord = [
            'id' => $billId,
            'customer_name' => $name,
            'consumer_id' => $consumer_id,
            'area' => $area,
            'city' => $city,
            'units' => floatval($units),
            'bill_amount' => floatval($bill),
            'billing_month' => $today,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $data['bills'][] = $billRecord;
        
        // Save breakdown
        foreach ($breakdown as $row) {
            $breakdownRecord = [
                'id' => (count($data['bill_breakdown']) > 0) ? max(array_column($data['bill_breakdown'], 'id', null) ?: [0]) + 1 : 1,
                'bill_id' => $billId,
                'slab_label' => $row['label'],
                'units' => floatval($row['units']),
                'rate' => floatval($row['rate']),
                'amount' => floatval($row['amount'])
            ];
            $data['bill_breakdown'][] = $breakdownRecord;
        }
        
        writeDatabase($data);
        return $billId;
    } catch (Exception $e) {
        error_log('Error saving bill: ' . $e->getMessage());
        return false;
    }
}

// Get all bills
function getAllBills($db) {
    try {
        $data = readDatabase();
        usort($data['bills'], function($a, $b) {
            $dateCompare = strcmp($b['billing_month'], $a['billing_month']);
            if ($dateCompare !== 0) return $dateCompare;
            return strcmp($b['created_at'], $a['created_at']);
        });
        return $data['bills'];
    } catch (Exception $e) {
        error_log('Error fetching bills: ' . $e->getMessage());
        return [];
    }
}

// Get bill breakdown
function getBillBreakdown($db, $billId) {
    try {
        $data = readDatabase();
        $breakdown = array_filter($data['bill_breakdown'], function($item) use ($billId) {
            return $item['bill_id'] == $billId;
        });
        return array_values($breakdown);
    } catch (Exception $e) {
        error_log('Error fetching breakdown: ' . $e->getMessage());
        return [];
    }
}

// Get monthly summary
function getMonthlySummary($db) {
    try {
        $data = readDatabase();
        $summary = [];
        
        foreach ($data['bills'] as $bill) {
            $month = $bill['billing_month'];
            if (!isset($summary[$month])) {
                $summary[$month] = [
                    'billing_month' => $month,
                    'record_count' => 0,
                    'total_units' => 0,
                    'total_amount' => 0,
                    'amounts' => []
                ];
            }
            $summary[$month]['record_count']++;
            $summary[$month]['total_units'] += $bill['units'];
            $summary[$month]['total_amount'] += $bill['bill_amount'];
            $summary[$month]['amounts'][] = $bill['bill_amount'];
        }
        
        // Calculate averages and convert to proper format
        foreach ($summary as &$month) {
            $month['avg_amount'] = $month['record_count'] > 0 ? 
                array_sum($month['amounts']) / $month['record_count'] : 0;
            unset($month['amounts']);
        }
        
        // Sort by month descending
        krsort($summary);
        return array_values($summary);
    } catch (Exception $e) {
        error_log('Error fetching summary: ' . $e->getMessage());
        return [];
    }
}

// Initialize database on first run
initializeDatabase();
?>

