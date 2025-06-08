# Tabular Data Analytics Tools for AI Agent

This documentation describes the comprehensive set of tabular data processing tools built for the AI agent, designed to transform CSV URL-based workflows into powerful local data processing pipelines with visualization capabilities.

## 🎯 **Key Changes & Improvements**

### **Previous Workflow:**
1. Chart tools receive CSV URLs directly
2. Charts process data on-the-fly from URLs
3. Limited data manipulation capabilities
4. No visibility into processed data

### **New Enhanced Workflow:**
1. **Load data** from CSV URLs into local processed versions
2. **Apply analytics operations** (clean, filter, aggregate, transform)
3. **Generate statistical insights** and data quality reports
4. **Create charts** with processed local data (no CSV URL dependency)
5. **Display processed CSV data** in dashboard panels alongside chart configurations

## 🛠️ **Available Tools**

### **1. loadData**
**Purpose:** Load tabular data from URLs and convert to local DataFrame format.

```javascript
loadData({
  source: "https://example.com/data.csv",
  format: "csv", // or "json"
  encoding: "utf-8",
  delimiter: ","
})
```

**Features:**
- Asynchronous loading with fallback processing
- Support for CSV and JSON formats
- Compatible with Danfo.js when available
- Returns data shape, headers, and type information

### **2. cleanData**
**Purpose:** Clean and standardize data for analysis.

```javascript
cleanData({
  data: processedData,
  headers: dataHeaders,
  options: {
    handleMissing: "drop", // "fill", "forward_fill", "backward_fill"
    fillValue: 0,
    standardize: ["column1", "column2"],
    removeDuplicates: true,
    dropColumns: ["unwanted_col"]
  }
})
```

**Operations:**
- Handle missing values (drop, fill, forward/backward fill)
- Standardize text columns (lowercase, trim)
- Remove duplicate rows
- Drop unnecessary columns

### **3. filterData**
**Purpose:** Filter data based on conditions for targeted analysis.

```javascript
filterData({
  data: processedData,
  headers: dataHeaders,
  conditions: [
    { column: "age", operator: ">", value: 30 },
    { column: "status", operator: "contains", value: "active" }
  ],
  logic: "AND" // or "OR"
})
```

**Operators:**
- Numeric: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Text: `contains`, `startsWith`, `endsWith`
- Array: `in`, `notIn`

### **4. aggregateData**
**Purpose:** Group and aggregate data for summary statistics.

```javascript
aggregateData({
  data: processedData,
  headers: dataHeaders,
  groupBy: ["country", "category"],
  aggregations: {
    total_sales: { columns: ["sales"], operation: "sum" },
    avg_price: { columns: ["price"], operation: "mean" },
    count_records: { columns: ["id"], operation: "count" }
  }
})
```

**Aggregation Operations:**
- `sum`, `mean`, `median`, `min`, `max`
- `count`, `std` (standard deviation), `var` (variance)

### **5. transformData**
**Purpose:** Apply transformations including type conversions and calculated columns.

```javascript
transformData({
  data: processedData,
  headers: dataHeaders,
  transformations: [
    { type: "convert_type", column: "price", operation: "number" },
    { type: "calculate", column: "total", newColumn: "profit", operation: "revenue - cost" },
    { type: "rename", column: "old_name", newColumn: "new_name" },
    { type: "normalize", column: "scores" }
  ]
})
```

**Transformation Types:**
- `convert_type`: Change data types
- `calculate`: Create calculated columns with formulas
- `rename`: Rename columns
- `date_parse`: Parse date strings
- `string_split`: Split strings into multiple columns
- `normalize`: Normalize numeric values to 0-1 range

### **6. analyzeStats**
**Purpose:** Comprehensive statistical analysis with data quality metrics.

```javascript
analyzeStats({
  data: processedData,
  headers: dataHeaders,
  columns: ["sales", "price", "quantity"], // optional
  includeCorrelation: true
})
```

**Statistical Metrics:**
- **Numeric columns:** mean, median, std, variance, min, max, quartiles, skewness, kurtosis
- **Categorical columns:** unique counts, value frequencies, most common values
- **Correlation matrix:** Pearson correlation between numeric columns
- **Data quality:** null counts, data types, outlier detection

### **7. exportProcessedData**
**Purpose:** Export processed data to CSV format for charts and further analysis.

```javascript
exportProcessedData({
  data: processedData,
  headers: dataHeaders,
  filename: "processed_sales_data",
  includeMetadata: true
})
```

### **8. createEnhancedDashboardChart**
**Purpose:** Create dashboard charts with integrated data processing pipeline.

```javascript
createEnhancedDashboardChart({
  csvUrl: "https://example.com/sales.csv",
  chartType: "bar",
  title: "Sales Analysis",
  description: "Monthly sales by region",
  
  // Data processing pipeline
  dataProcessing: {
    clean: {
      enabled: true,
      handleMissing: "drop",
      removeDuplicates: true
    },
    filter: {
      enabled: true,
      conditions: [{ column: "status", operator: "==", value: "completed" }]
    },
    aggregate: {
      enabled: true,
      groupBy: ["region"],
      aggregations: {
        total: { columns: ["amount"], operation: "sum" }
      }
    },
    analyze: {
      enabled: true,
      includeCorrelation: true
    }
  },
  
  // Chart configuration
  dataMapping: {
    indexBy: "region",
    valueColumns: ["amount_total"]
  },
  
  insights: "Regional sales show significant variation...",
  recommendations: ["Focus on underperforming regions", "Analyze seasonal trends"]
})
```

## 📊 **Enhanced Dashboard Features**

### **Dual-Panel Layout**
The enhanced dashboard now includes a revolutionary dual-panel layout:

1. **Configuration Panel:** 
   - Chart type settings
   - Visual customization options
   - Data mapping controls
   - Color schemes and styling

2. **Data Panel:**
   - **Processed CSV data display** with search functionality
   - **Processing pipeline visualization** showing applied operations
   - **Statistical insights** and data quality metrics
   - **Export functionality** (copy to clipboard, download CSV)
   - **Processing metadata** (source URL, processing steps, timestamps)

### **Key Features:**
- ✅ **Local data processing** (no CSV URL dependency for charts)
- ✅ **Transparent data pipeline** (see exactly what operations were applied)
- ✅ **Interactive data exploration** (search, filter, export processed data)
- ✅ **Statistical analysis integration** (automatic insights generation)
- ✅ **Processing history** (track all data transformations)

## 🚀 **Usage Examples**

### **Example 1: Sales Data Analysis**
```javascript
// 1. Load sales data
const salesData = await loadData({
  source: "https://api.company.com/sales.csv",
  format: "csv"
});

// 2. Clean the data
const cleanedData = await cleanData({
  data: salesData.data,
  headers: salesData.headers,
  options: {
    handleMissing: "drop",
    standardize: ["product_name", "customer_type"],
    removeDuplicates: true
  }
});

// 3. Filter for current year
const currentYearData = await filterData({
  data: cleanedData.data,
  headers: cleanedData.headers,
  conditions: [
    { column: "year", operator: "==", value: 2024 }
  ]
});

// 4. Aggregate by product category
const aggregatedData = await aggregateData({
  data: currentYearData.data,
  headers: currentYearData.headers,
  groupBy: ["product_category"],
  aggregations: {
    total_sales: { columns: ["sales_amount"], operation: "sum" },
    avg_price: { columns: ["unit_price"], operation: "mean" },
    order_count: { columns: ["order_id"], operation: "count" }
  }
});

// 5. Create enhanced chart
await createEnhancedDashboardChart({
  csvUrl: "https://api.company.com/sales.csv",
  chartType: "bar",
  title: "2024 Sales by Product Category",
  dataProcessing: {
    clean: { enabled: true, handleMissing: "drop", removeDuplicates: true },
    filter: { enabled: true, conditions: [{ column: "year", operator: "==", value: 2024 }] },
    aggregate: { 
      enabled: true,
      groupBy: ["product_category"],
      aggregations: {
        total: { columns: ["sales_amount"], operation: "sum" }
      }
    }
  },
  dataMapping: {
    indexBy: "product_category",
    valueColumns: ["sales_amount_total"]
  }
});
```

### **Example 2: Customer Behavior Analysis**
```javascript
await createEnhancedDashboardChart({
  csvUrl: "https://analytics.company.com/customer_data.csv",
  chartType: "scatter",
  title: "Customer Lifetime Value vs Purchase Frequency",
  dataProcessing: {
    clean: {
      enabled: true,
      handleMissing: "fill",
      fillValue: 0
    },
    transform: {
      enabled: true,
      transformations: [
        { type: "calculate", newColumn: "clv_score", operation: "total_spent / months_active" },
        { type: "normalize", column: "purchase_frequency" }
      ]
    },
    analyze: {
      enabled: true,
      includeCorrelation: true,
      columns: ["clv_score", "purchase_frequency", "satisfaction_rating"]
    }
  },
  dataMapping: {
    xColumn: "purchase_frequency",
    yColumn: "clv_score",
    sizeColumn: "satisfaction_rating"
  },
  insights: "Strong correlation between purchase frequency and customer lifetime value.",
  recommendations: [
    "Focus retention efforts on high-frequency customers",
    "Implement loyalty programs for medium-frequency segments"
  ]
});
```

## 🎨 **Dashboard UI Enhancements**

### **Full-Screen Chart View**
- **Tabbed interface:** Switch between Configuration and Data panels
- **Processing visualization:** See the complete data pipeline with numbered steps
- **Statistical insights:** Automatic analysis results displayed in dedicated sections
- **Metadata tracking:** Source URLs, processing timestamps, data shapes

### **Data Panel Features**
- **Interactive table:** Searchable, scrollable data display
- **Export options:** Copy to clipboard or download as CSV
- **Processing history:** Complete audit trail of data operations
- **Data quality metrics:** Row/column counts, data types, processing status

## 🔧 **Technical Implementation**

### **Architecture Benefits**
1. **Separation of Concerns:** Data processing is separate from visualization
2. **Reusability:** Processed data can be used for multiple charts
3. **Transparency:** Complete visibility into data transformations
4. **Performance:** Local processing reduces repeated URL fetches
5. **Extensibility:** Easy to add new data operations

### **Fallback Strategy**
- **Primary:** Uses Danfo.js for advanced data operations
- **Fallback:** Custom JavaScript implementations when Danfo.js unavailable
- **Compatibility:** Works in both Node.js and browser environments

### **Error Handling**
- Graceful degradation for network issues
- Comprehensive error messages for data processing failures
- Validation for data types and operations
- Recovery mechanisms for partial processing failures

## 📈 **Use Cases & Benefits**

### **For Data Analysts**
- **Complete control** over data processing pipeline
- **Reproducible analysis** with documented processing steps
- **Quality assurance** through statistical analysis and data profiling
- **Efficient workflow** with integrated processing and visualization

### **For Business Users**
- **Transparent insights** with visible data transformations
- **Interactive exploration** of processed data
- **Export capabilities** for further analysis
- **Audit trail** for compliance and verification

### **For Developers**
- **Modular architecture** for easy maintenance and extension
- **Type-safe operations** with comprehensive parameter validation
- **Performance optimization** through local data processing
- **Integration-ready** design for existing dashboards

## 🚦 **Getting Started**

1. **Install Dependencies:** Ensure Danfo.js is available (falls back gracefully if not)
2. **Import Tools:** Use individual tools or the enhanced dashboard chart creator
3. **Configure Processing:** Define your data pipeline with cleaning, filtering, and transformation steps
4. **Create Visualizations:** Generate charts with processed local data
5. **Explore Results:** Use the enhanced dashboard to explore data and configurations

The new tabular data analytics system transforms your CSV-based workflow into a powerful, transparent, and efficient data processing pipeline with rich visualization capabilities. No more black-box data processing – now you have complete control and visibility over every step of your data analysis journey! 🎉 