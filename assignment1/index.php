<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Electricity Bill Calculator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="page">
        <header class="hero">
            <div class="hero-inner">
                <h1>Electricity Bill Calculator</h1>
                <p class="tag">Responsive, clear slab breakdown and instant preview</p>
            </div>
        </header>

        <main class="container">
            <form method="post" id="billForm" class="grid">
                <div class="card">
                    <h2>Customer Details</h2>
                    <label>
                        Name
                        <input type="text" name="name" value="<?php echo isset($_POST['name'])?htmlspecialchars($_POST['name']):''; ?>" placeholder="Full name">
                    </label>
                    <label>
                        Consumer ID
                        <input type="text" name="consumer_id" value="<?php echo isset($_POST['consumer_id'])?htmlspecialchars($_POST['consumer_id']):''; ?>" placeholder="Optional">
                    </label>
                    <label>
                        Area / Locality
                        <input type="text" name="area" value="<?php echo isset($_POST['area'])?htmlspecialchars($_POST['area']):''; ?>" placeholder="Area / Street">
                    </label>
                    <label>
                        City
                        <input type="text" name="city" value="<?php echo isset($_POST['city'])?htmlspecialchars($_POST['city']):''; ?>" placeholder="City">
                    </label>
                </div>

                <div class="card">
                    <h2>Billing</h2>
                    <label>
                        Units Consumed
                        <input id="units" type="number" name="units" min="0" step="any" required value="<?php echo isset($_POST['units'])?htmlspecialchars($_POST['units']):''; ?>">
                    </label>
                    <div class="actions">
                        <button type="submit">Calculate</button>
                        <button type="button" id="resetBtn" class="muted">Reset</button>
                    </div>

                    <div id="preview" class="preview">
                        <strong>Live Preview:</strong>
                        <div id="previewText">Enter units to see estimated bill</div>
                    </div>
                </div>

                <div class="card result-card">
                    <h2>Result</h2>
                    <div id="serverResult">
                        <?php
                        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['units'])) {
                                $name = trim($_POST['name'] ?? '');
                                $consumer = trim($_POST['consumer_id'] ?? '');
                                $area = trim($_POST['area'] ?? '');
                                $city = trim($_POST['city'] ?? '');
                                $units = floatval($_POST['units']);

                                $bill = 0.0;
                                $remaining = $units;
                                $breakdown = [];

                                // slab 1
                                $take = min($remaining, 50);
                                $breakdown[] = ['label' => 'First 50 units', 'units' => $take, 'rate' => 3.50, 'amount' => $take * 3.50];
                                $bill += $take * 3.50;
                                $remaining -= $take;

                                if ($remaining > 0) {
                                        $take = min($remaining, 100);
                                        $breakdown[] = ['label' => 'Next 100 units', 'units' => $take, 'rate' => 4.00, 'amount' => $take * 4.00];
                                        $bill += $take * 4.00;
                                        $remaining -= $take;
                                }

                                if ($remaining > 0) {
                                        $take = min($remaining, 100);
                                        $breakdown[] = ['label' => 'Next 100 units', 'units' => $take, 'rate' => 5.20, 'amount' => $take * 5.20];
                                        $bill += $take * 5.20;
                                        $remaining -= $take;
                                }

                                if ($remaining > 0) {
                                        $take = $remaining;
                                        $breakdown[] = ['label' => 'Above 250 units', 'units' => $take, 'rate' => 6.50, 'amount' => $take * 6.50];
                                        $bill += $take * 6.50;
                                        $remaining -= $take;
                                }

                                echo '<div class="customer">';
                                if ($name) echo '<div><strong>Name:</strong> '.htmlspecialchars($name).'</div>';
                                if ($consumer) echo '<div><strong>Consumer ID:</strong> '.htmlspecialchars($consumer).'</div>';
                                if ($area || $city) echo '<div><strong>Location:</strong> '.htmlspecialchars(trim($area.' '. $city)).'</div>';
                                echo '</div>';

                                echo '<table class="breakdown"><thead><tr><th>Slab</th><th>Units</th><th>Rate</th><th>Amount (Rs.)</th></tr></thead><tbody>';
                                foreach ($breakdown as $row) {
                                        echo '<tr>';
                                        echo '<td>'.htmlspecialchars($row['label']).'</td>';
                                        echo '<td>'.htmlspecialchars(number_format($row['units'],2)).'</td>';
                                        echo '<td>'.htmlspecialchars(number_format($row['rate'],2)).'</td>';
                                        echo '<td>'.htmlspecialchars(number_format($row['amount'],2)).'</td>';
                                        echo '</tr>';
                                }
                                echo '</tbody></table>';

                                echo '<div class="total"><strong>Total Units:</strong> '.htmlspecialchars(number_format($units,2)).' &nbsp; <strong>Total Bill:</strong> Rs. '.number_format($bill,2).'</div>';
                        }
                        ?>
                    </div>
                </div>
            </form>
        </main>

        <footer class="foot">
            <small>Designed for assignment — slab rates applied as specified.</small>
        </footer>
    </div>

    <script>
        // replicate slab calculation in JS for live preview
        function calcBill(units) {
            units = Number(units) || 0;
            var bill = 0;
            var remaining = units;
            var parts = [];

            var take = Math.min(remaining,50);
            parts.push({label:'First 50 units', units: take, rate:3.50, amount: take*3.50});
            bill += take*3.50; remaining -= take;

            if (remaining>0){ take = Math.min(remaining,100); parts.push({label:'Next 100 units', units: take, rate:4.00, amount: take*4.00}); bill += take*4.00; remaining -= take; }
            if (remaining>0){ take = Math.min(remaining,100); parts.push({label:'Next 100 units', units: take, rate:5.20, amount: take*5.20}); bill += take*5.20; remaining -= take; }
            if (remaining>0){ take = remaining; parts.push({label:'Above 250 units', units: take, rate:6.50, amount: take*6.50}); bill += take*6.50; remaining -= take; }

            return {bill: bill, parts: parts};
        }

        var unitsInput = document.getElementById('units');
        var previewText = document.getElementById('previewText');
        var resetBtn = document.getElementById('resetBtn');

        function updatePreview(){
            var v = unitsInput.value;
            if (v === '') { previewText.textContent = 'Enter units to see estimated bill'; return; }
            var res = calcBill(v);
            var html = 'Estimated bill: Rs. ' + res.bill.toFixed(2) + '\n';
            html += '\nBreakdown:\n';
            res.parts.forEach(function(p){ html += p.label + ': ' + p.units.toFixed(2) + ' units × Rs.' + p.rate.toFixed(2) + ' = Rs.' + p.amount.toFixed(2) + '\n'; });
            previewText.textContent = html;
        }

        unitsInput.addEventListener('input', updatePreview);
        resetBtn.addEventListener('click', function(){ document.getElementById('billForm').reset(); previewText.textContent='Enter units to see estimated bill'; document.getElementById('serverResult').innerHTML=''; });
        // initialize
        updatePreview();
    </script>
</body>
</html>
