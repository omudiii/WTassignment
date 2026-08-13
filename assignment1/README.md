# Electricity Bill Calculator - With Database

A responsive, database-enabled electricity bill calculator built with PHP, SQLite, HTML, and CSS.

## Features

✅ **Smart Bill Calculation** - Progressive slab rates for accurate billing
✅ **Database Storage** - All bills saved automatically to SQLite database  
✅ **Billing History** - View all monthly bills, usage, and amounts
✅ **Monthly Summary** - Aggregate statistics across all months
✅ **Slab Breakdown** - Detailed breakdown for each bill with expandable details
✅ **Real-time Preview** - Live bill calculation as you enter units
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Slab Rates

- **First 50 units**: Rs. 3.50/unit
- **Next 100 units**: Rs. 4.00/unit  
- **Next 100 units**: Rs. 5.20/unit
- **Above 250 units**: Rs. 6.50/unit

## Technology Stack

- **Backend**: PHP 7.4+
- **Database**: SQLite (local, no setup required)
- **Frontend**: HTML5, CSS3, JavaScript
- **Server**: PHP Built-in Development Server

## Files

- `index.php` — Main application with form and database integration
- `db.php` — Database connection, initialization, and helper functions
- `style.css` — Responsive CSS for all components
- `bills.db` — SQLite database (auto-created on first run)
- `assignment1.docx` — Assignment documentation

## Installation & Usage

### Prerequisites
- PHP 7.4 or higher
- No additional packages required (SQLite is built into PHP)

### Run Locally

```bash
# Navigate to project directory
cd assignment1/

# Start PHP development server
php -S localhost:8000 -t .

# Open in browser
# http://localhost:8000/index.php
```

## How It Works

1. **Enter Customer Details** - Name, Consumer ID, Area, City (optional)
2. **Enter Units Consumed** - The system shows live preview
3. **Calculate** - Bill is calculated using slab rates and saved to database
4. **View History** - All billing records appear in the history table below
5. **Monitor Summary** - Monthly aggregated statistics are updated

## Database Schema

### bills table
- `id` - Primary key
- `customer_name` - Customer name
- `consumer_id` - Consumer ID (optional)
- `area` - Area/Locality
- `city` - City
- `units` - Units consumed
- `bill_amount` - Total bill in Rs.
- `billing_month` - Month of billing
- `created_at` - Timestamp

### bill_breakdown table
- `id` - Primary key
- `bill_id` - Foreign key to bills
- `slab_label` - Slab description
- `units` - Units in this slab
- `rate` - Rate per unit
- `amount` - Amount for this slab

## Features

### Bill Calculation
- Progressive slab-based pricing
- Detailed slab breakdown
- Customer information display

### Database Features
- Automatic bill saving
- Historical record tracking
- Monthly summaries and statistics
- Expandable bill details

### User Interface
- Clean, modern design
- Responsive layout
- Real-time preview
- Easy navigation

## Notes

- Database file (`bills.db`) is created automatically on first run
- All billing records are persistent across sessions
- The application is fully responsive and mobile-friendly
- No external dependencies required

## Student Information

- **Name**: Om Chavhan
- **Class**: CS-N
- **Division**: N
- **Roll No**: 4

## GitHub

Push to GitHub:
```bash
git remote add origin https://github.com/om-chavhan/electricity-bill-calculator
git branch -M main
git push -u origin main
```

