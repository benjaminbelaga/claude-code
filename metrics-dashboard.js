/**
 * Smart Wrapper Metrics Dashboard
 *
 * Exports usage metrics from Script Properties to Google Sheets
 * and creates automated visualizations.
 *
 * @author Benjamin Belaga
 * @version 1.0.0
 * @date 2025-10-27
 */

/**
 * Dashboard Configuration
 */
const DASHBOARD_CONFIG = {
  sheetName: 'Smart Wrapper Metrics',
  refreshInterval: 3600000, // 1 hour in milliseconds
  chartColors: {
    v2_fetch_only: '#4285F4',           // Blue
    v3_recalc_then_v2_fetch: '#34A853', // Green
    fallback_v2_only: '#FBBC04',        // Yellow
    fallback_v3_then_v2: '#EA4335',     // Red
    critical_failure: '#9E9E9E'         // Gray
  }
};

/**
 * Create or get metrics dashboard sheet
 *
 * @returns {Sheet} The metrics dashboard sheet
 */
function getOrCreateDashboardSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(DASHBOARD_CONFIG.sheetName);

  if (!sheet) {
    Logger.log(`Creating new sheet: ${DASHBOARD_CONFIG.sheetName}`);
    sheet = spreadsheet.insertSheet(DASHBOARD_CONFIG.sheetName);

    // Move to first position (after active sheet)
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(1);
  }

  return sheet;
}

/**
 * Export metrics from Script Properties to Sheet
 *
 * Main function that refreshes the dashboard with latest metrics data
 */
function exportMetricsToDashboard() {
  Logger.log('\n📊 EXPORTING METRICS TO DASHBOARD');
  Logger.log('='.repeat(60));

  const startTime = new Date().getTime();

  // Get or create dashboard sheet
  const sheet = getOrCreateDashboardSheet();

  // Clear existing content
  sheet.clear();

  // Set up header
  setupDashboardHeader(sheet);

  // Get metrics data
  const metricsData = getMetricsData();

  if (metricsData.length === 0) {
    Logger.log('⚠️  No metrics data available yet');

    // Show message on sheet
    sheet.getRange('A3').setValue('No metrics data available yet.');
    sheet.getRange('A4').setValue('Run Smart Wrapper functions to generate metrics.');
    return;
  }

  // Write data to sheet
  writeMetricsData(sheet, metricsData);

  // Create summary section
  createSummarySection(sheet, metricsData);

  // Create charts
  createMetricsCharts(sheet, metricsData);

  // Format sheet
  formatDashboard(sheet);

  const endTime = new Date().getTime();
  const totalTime = endTime - startTime;

  Logger.log(`\n✅ Dashboard export complete: ${totalTime}ms`);
  Logger.log(`   Metrics entries: ${metricsData.length}`);
  Logger.log(`   Date range: ${metricsData[metricsData.length - 1].date} to ${metricsData[0].date}`);

  // Show success message
  SpreadsheetApp.getUi().alert(
    '✅ Metrics Dashboard Updated!\n\n' +
    `Entries: ${metricsData.length}\n` +
    `Time: ${totalTime}ms\n\n` +
    'Check the "Smart Wrapper Metrics" sheet for visualizations.'
  );
}

/**
 * Set up dashboard header
 *
 * @param {Sheet} sheet - Dashboard sheet
 */
function setupDashboardHeader(sheet) {
  // Title
  sheet.getRange('A1').setValue('Smart Wrapper Metrics Dashboard');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');

  // Last updated
  sheet.getRange('A2').setValue(`Last Updated: ${new Date().toLocaleString()}`);
  sheet.getRange('A2').setFontSize(10).setFontStyle('italic');

  // Data table header (starts at row 5)
  const headers = ['Date', 'Strategy', 'Calls', 'Avg Time (ms)', 'Avg SKUs', 'Total Time (ms)', 'Total SKUs'];
  sheet.getRange(5, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(5, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285F4')
    .setFontColor('#FFFFFF');
}

/**
 * Get metrics data from Script Properties
 *
 * @returns {Array<Object>} Array of metrics objects
 */
function getMetricsData() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allKeys = scriptProperties.getKeys();

  const metricsKeys = allKeys.filter(k => k.startsWith('metrics_'));

  if (metricsKeys.length === 0) {
    return [];
  }

  const metricsData = [];

  metricsKeys.forEach(key => {
    try {
      const data = JSON.parse(scriptProperties.getProperty(key));
      const parts = key.split('_');
      const date = parts[parts.length - 1]; // Last part is date
      const strategy = parts.slice(1, -1).join('_'); // Middle parts are strategy

      metricsData.push({
        date: date,
        strategy: strategy,
        calls: data.calls || 0,
        avgTime: data.calls > 0 ? Math.round(data.totalTime / data.calls) : 0,
        avgSkus: data.calls > 0 ? Math.round(data.totalSkus / data.calls) : 0,
        totalTime: data.totalTime || 0,
        totalSkus: data.totalSkus || 0
      });
    } catch (error) {
      Logger.log(`⚠️  Error parsing metrics key: ${key} - ${error.message}`);
    }
  });

  // Sort by date descending (most recent first)
  metricsData.sort((a, b) => b.date.localeCompare(a.date));

  return metricsData;
}

/**
 * Write metrics data to sheet
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function writeMetricsData(sheet, metricsData) {
  const startRow = 6; // Data starts after header at row 5

  const rows = metricsData.map(m => [
    m.date,
    m.strategy,
    m.calls,
    m.avgTime,
    m.avgSkus,
    m.totalTime,
    m.totalSkus
  ]);

  if (rows.length > 0) {
    sheet.getRange(startRow, 1, rows.length, 7).setValues(rows);

    // Format numbers
    sheet.getRange(startRow, 3, rows.length, 1).setNumberFormat('#,##0'); // Calls
    sheet.getRange(startRow, 4, rows.length, 1).setNumberFormat('#,##0'); // Avg Time
    sheet.getRange(startRow, 5, rows.length, 1).setNumberFormat('#,##0'); // Avg SKUs
    sheet.getRange(startRow, 6, rows.length, 1).setNumberFormat('#,##0'); // Total Time
    sheet.getRange(startRow, 7, rows.length, 1).setNumberFormat('#,##0'); // Total SKUs
  }
}

/**
 * Create summary section with key metrics
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function createSummarySection(sheet, metricsData) {
  const summaryStartRow = 5;
  const summaryStartCol = 9; // Column I

  // Calculate summary statistics
  const totalCalls = metricsData.reduce((sum, m) => sum + m.calls, 0);
  const totalTime = metricsData.reduce((sum, m) => sum + m.totalTime, 0);
  const totalSkus = metricsData.reduce((sum, m) => sum + m.totalSkus, 0);

  // Strategy breakdown
  const strategyStats = {};
  metricsData.forEach(m => {
    if (!strategyStats[m.strategy]) {
      strategyStats[m.strategy] = { calls: 0, time: 0, skus: 0 };
    }
    strategyStats[m.strategy].calls += m.calls;
    strategyStats[m.strategy].time += m.totalTime;
    strategyStats[m.strategy].skus += m.totalSkus;
  });

  // v2 vs v3 adoption
  const v2Calls = strategyStats['v2_fetch_only']?.calls || 0;
  const v3Calls = strategyStats['v3_recalc_then_v2_fetch']?.calls || 0;
  const v2Percentage = totalCalls > 0 ? Math.round((v2Calls / totalCalls) * 100) : 0;
  const v3Percentage = totalCalls > 0 ? Math.round((v3Calls / totalCalls) * 100) : 0;

  // Average performance
  const avgTimePerCall = totalCalls > 0 ? Math.round(totalTime / totalCalls) : 0;
  const avgSkusPerCall = totalCalls > 0 ? Math.round(totalSkus / totalCalls) : 0;

  // Write summary header
  sheet.getRange(summaryStartRow, summaryStartCol).setValue('📊 Summary Statistics');
  sheet.getRange(summaryStartRow, summaryStartCol).setFontWeight('bold').setFontSize(14);

  // Write statistics
  const summaryData = [
    ['Total Calls:', totalCalls],
    ['Total Time:', `${Math.round(totalTime / 1000)}s`],
    ['Total SKUs Processed:', totalSkus],
    ['', ''],
    ['Avg Time per Call:', `${avgTimePerCall}ms`],
    ['Avg SKUs per Call:', avgSkusPerCall],
    ['', ''],
    ['v2 Fast Read:', `${v2Calls} calls (${v2Percentage}%)`],
    ['v3 Forced Recalc:', `${v3Calls} calls (${v3Percentage}%)`],
    ['', ''],
    ['Fallback Triggers:', (strategyStats['fallback_v2_only']?.calls || 0) + (strategyStats['fallback_v3_then_v2']?.calls || 0)],
    ['Critical Failures:', strategyStats['critical_failure']?.calls || 0]
  ];

  sheet.getRange(summaryStartRow + 1, summaryStartCol, summaryData.length, 2).setValues(summaryData);

  // Format summary section
  sheet.getRange(summaryStartRow + 1, summaryStartCol, summaryData.length, 1).setFontWeight('bold');
  sheet.getRange(summaryStartRow, summaryStartCol, summaryData.length + 1, 2)
    .setBorder(true, true, true, true, true, true);
}

/**
 * Create charts for metrics visualization
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function createMetricsCharts(sheet, metricsData) {
  // Remove existing charts
  const charts = sheet.getCharts();
  charts.forEach(chart => sheet.removeChart(chart));

  // Chart 1: Strategy Adoption (Pie Chart)
  createStrategyAdoptionChart(sheet, metricsData);

  // Chart 2: Performance Over Time (Line Chart)
  createPerformanceTimelineChart(sheet, metricsData);

  // Chart 3: Daily Call Volume (Column Chart)
  createDailyCallVolumeChart(sheet, metricsData);
}

/**
 * Create pie chart showing strategy adoption
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function createStrategyAdoptionChart(sheet, metricsData) {
  // Aggregate calls by strategy
  const strategyTotals = {};
  metricsData.forEach(m => {
    if (!strategyTotals[m.strategy]) {
      strategyTotals[m.strategy] = 0;
    }
    strategyTotals[m.strategy] += m.calls;
  });

  // Create data range for chart
  const chartDataStart = sheet.getLastRow() + 3;
  sheet.getRange(chartDataStart, 1).setValue('Strategy');
  sheet.getRange(chartDataStart, 2).setValue('Calls');

  let row = chartDataStart + 1;
  Object.keys(strategyTotals).forEach(strategy => {
    sheet.getRange(row, 1).setValue(strategy);
    sheet.getRange(row, 2).setValue(strategyTotals[strategy]);
    row++;
  });

  const dataRange = sheet.getRange(chartDataStart, 1, Object.keys(strategyTotals).length + 1, 2);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dataRange)
    .setPosition(20, 1, 0, 0)
    .setOption('title', 'Strategy Adoption Rate')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('pieHole', 0.4)
    .setOption('colors', Object.keys(strategyTotals).map(s => DASHBOARD_CONFIG.chartColors[s] || '#9E9E9E'))
    .build();

  sheet.insertChart(chart);
}

/**
 * Create line chart showing performance over time
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function createPerformanceTimelineChart(sheet, metricsData) {
  // Group by date and strategy
  const dateStrategyMap = {};

  metricsData.forEach(m => {
    if (!dateStrategyMap[m.date]) {
      dateStrategyMap[m.date] = {};
    }
    dateStrategyMap[m.date][m.strategy] = m.avgTime;
  });

  // Get unique dates and strategies
  const dates = Object.keys(dateStrategyMap).sort();
  const strategies = [...new Set(metricsData.map(m => m.strategy))];

  // Create data range
  const chartDataStart = sheet.getLastRow() + 3;

  // Header row
  sheet.getRange(chartDataStart, 1).setValue('Date');
  strategies.forEach((strategy, idx) => {
    sheet.getRange(chartDataStart, idx + 2).setValue(strategy);
  });

  // Data rows
  dates.forEach((date, dateIdx) => {
    const row = chartDataStart + dateIdx + 1;
    sheet.getRange(row, 1).setValue(date);

    strategies.forEach((strategy, strategyIdx) => {
      const value = dateStrategyMap[date][strategy] || 0;
      sheet.getRange(row, strategyIdx + 2).setValue(value);
    });
  });

  const dataRange = sheet.getRange(chartDataStart, 1, dates.length + 1, strategies.length + 1);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(dataRange)
    .setPosition(20, 6, 0, 0)
    .setOption('title', 'Average Response Time Over Time')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('vAxis', { title: 'Time (ms)' })
    .setOption('hAxis', { title: 'Date' })
    .setOption('legend', { position: 'bottom' })
    .build();

  sheet.insertChart(chart);
}

/**
 * Create column chart showing daily call volume
 *
 * @param {Sheet} sheet - Dashboard sheet
 * @param {Array<Object>} metricsData - Metrics data array
 */
function createDailyCallVolumeChart(sheet, metricsData) {
  // Group by date
  const dailyTotals = {};

  metricsData.forEach(m => {
    if (!dailyTotals[m.date]) {
      dailyTotals[m.date] = 0;
    }
    dailyTotals[m.date] += m.calls;
  });

  const dates = Object.keys(dailyTotals).sort();

  // Create data range
  const chartDataStart = sheet.getLastRow() + 3;
  sheet.getRange(chartDataStart, 1).setValue('Date');
  sheet.getRange(chartDataStart, 2).setValue('Total Calls');

  dates.forEach((date, idx) => {
    const row = chartDataStart + idx + 1;
    sheet.getRange(row, 1).setValue(date);
    sheet.getRange(row, 2).setValue(dailyTotals[date]);
  });

  const dataRange = sheet.getRange(chartDataStart, 1, dates.length + 1, 2);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dataRange)
    .setPosition(40, 1, 0, 0)
    .setOption('title', 'Daily Call Volume')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('vAxis', { title: 'Calls' })
    .setOption('hAxis', { title: 'Date' })
    .setOption('colors', ['#4285F4'])
    .build();

  sheet.insertChart(chart);
}

/**
 * Format dashboard sheet for better readability
 *
 * @param {Sheet} sheet - Dashboard sheet
 */
function formatDashboard(sheet) {
  // Auto-resize columns
  sheet.autoResizeColumns(1, 7);

  // Freeze header rows
  sheet.setFrozenRows(5);

  // Add alternating row colors to data table
  const lastRow = sheet.getLastRow();
  if (lastRow > 5) {
    const dataRange = sheet.getRange(6, 1, lastRow - 5, 7);
    dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  }

  // Center align numbers
  if (lastRow > 5) {
    sheet.getRange(6, 3, lastRow - 5, 5).setHorizontalAlignment('center');
  }
}

/**
 * Add menu item for dashboard refresh
 * Call this from main menu setup
 */
function addDashboardMenuItem() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Smart Wrapper')
    .addItem('📊 Refresh Metrics Dashboard', 'exportMetricsToDashboard')
    .addItem('🧪 Run Quick Test', 'quickSanityTest')
    .addItem('🧹 Clear Old Metrics (30 days)', 'clearOldMetrics')
    .addToUi();
}

/**
 * Auto-refresh dashboard on spreadsheet open
 * Uncomment to enable auto-refresh
 */
// function onOpen() {
//   addDashboardMenuItem();
//
//   // Auto-refresh if last update was >1 hour ago
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DASHBOARD_CONFIG.sheetName);
//   if (sheet) {
//     const lastUpdate = sheet.getRange('A2').getValue();
//     const lastUpdateTime = new Date(lastUpdate.replace('Last Updated: ', ''));
//     const now = new Date();
//
//     if (now - lastUpdateTime > DASHBOARD_CONFIG.refreshInterval) {
//       exportMetricsToDashboard();
//     }
//   }
// }

