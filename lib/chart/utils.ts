// Chart Library Utilities - Server-safe functions
// This file contains only utility functions without React component imports

// Supported chart types
export function getSupportedChartTypes() {
  return [
    'scatter', 'bar', 'line', 'pie', 'heatmap', 'radar', 'areaBump', 
    'calendar', 'chord', 'circlePacking', 'sankey', 'boxplot',
    'bump', 'bullet', 'funnel', 'stream', 'sunburst', 'waffle',
    'network', 'radialbar', 'swarmplot', 'treemap', 'voronoi'
  ];
}

export function isChartTypeSupported(chartType: string) {
  return getSupportedChartTypes().includes(chartType);
}

// Data mapping examples for each chart type
export function getDataMappingExamples(): Record<string, { description: string; example: Record<string, any> }> {
  return {
    scatter: {
      description: "Scatter plots show relationships between two numeric variables with optional grouping and sizing.",
      example: {
        csvColumns: ["Height", "Weight", "Age", "Gender"],
        dataMapping: {
          xColumn: "Height",
          yColumn: "Weight", 
          seriesColumn: "Gender",
          sizeColumn: "Age"
        },
        description: "Shows height vs weight relationship, grouped by gender with age determining point size"
      }
    },
    
    bar: {
      description: "Bar charts display categorical data with rectangular bars. Each category (indexBy) can have multiple values (valueColumns) shown as grouped or stacked bars.",
      example: {
        csvColumns: ["Product", "Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"],
        dataMapping: {
          indexBy: "Product",
          valueColumns: ["Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"]
        },
        description: "Shows quarterly sales by product, with each quarter as a separate bar or stack segment"
      }
    },

    line: {
      description: "Line charts display trends over time or continuous data with multiple series as separate lines.",
      example: {
        csvColumns: ["Date", "Revenue", "Profit", "Expenses"],
        dataMapping: {
          xColumn: "Date",
          yColumns: ["Revenue", "Profit", "Expenses"]
        },
        description: "Shows financial metrics over time with each metric as a separate line"
      }
    },

    pie: {
      description: "Pie charts show proportional data as slices of a circle, ideal for showing parts of a whole.",
      example: {
        csvColumns: ["Category", "Sales", "Region"],
        dataMapping: {
          idColumn: "Category",
          valueColumn: "Sales"
        },
        description: "Shows sales distribution across categories as pie slices"
      }
    },

    heatmap: {
      description: "Heatmaps show intensity of values across two dimensions using color gradients.",
      example: {
        csvColumns: ["Day", "Hour", "Temperature", "Region"],
        dataMapping: {
          xColumn: "Day",
          yColumn: "Hour",
          valueColumn: "Temperature"
        },
        description: "Shows temperature intensity across days and hours using color coding"
      }
    },

    radar: {
      description: "Radar charts display multivariate data on multiple axes emanating from a center point.",
      example: {
        csvColumns: ["Player", "Speed", "Strength", "Agility", "Defense"],
        dataMapping: {
          indexBy: "Player",
          valueColumns: ["Speed", "Strength", "Agility", "Defense"]
        },
        description: "Shows player abilities across multiple dimensions in a spider web format"
      }
    },

    areaBump: {
      description: "Area bump charts show ranking changes over time with filled areas representing different categories.",
      example: {
        csvColumns: ["Year", "CompanyA", "CompanyB", "CompanyC", "CompanyD"],
        dataMapping: {
          xColumn: "Year",
          seriesColumns: ["CompanyA", "CompanyB", "CompanyC", "CompanyD"]
        },
        description: "Shows market share evolution of companies over years"
      }
    },

    calendar: {
      description: "Calendar charts display time-based data in a calendar format showing daily patterns.",
      example: {
        csvColumns: ["Date", "Activity", "Temperature"],
        dataMapping: {
          dateColumn: "Date",
          valueColumn: "Activity"
        },
        description: "Shows daily activity levels in a calendar grid layout"
      }
    },

    chord: {
      description: "Chord diagrams show relationships and flows between different entities in a circular layout.",
      example: {
        csvColumns: ["Source", "Target", "Flow", "Type"],
        dataMapping: {
          fromColumn: "Source",
          toColumn: "Target",
          valueColumn: "Flow"
        },
        description: "Shows flow patterns between sources and targets in a circular chord diagram"
      }
    },

    circlePacking: {
      description: "Circle packing shows hierarchical data as nested circles with sizes representing values.",
      example: {
        csvColumns: ["ID", "Parent", "Value", "Category"],
        dataMapping: {
          idColumn: "ID",
          parentColumn: "Parent",
          valueColumn: "Value"
        },
        description: "Shows hierarchical data with circles nested based on parent-child relationships"
      }
    },

    sankey: {
      description: "Sankey diagrams visualize flow and transformation between different stages or categories.",
      example: {
        csvColumns: ["Source", "Target", "Value", "Type"],
        dataMapping: {
          sourceColumn: "Source",
          targetColumn: "Target", 
          valueColumn: "Value"
        },
        description: "Shows flow magnitudes between source and target nodes"
      }
    },

    boxplot: {
      description: "Box plots show the distribution of values through quartiles and outliers for different groups.",
      example: {
        csvColumns: ["Category", "Score", "Group", "Region"],
        dataMapping: {
          groupBy: "Category",
          value: "Score",
          subGroup: "Group"
        },
        description: "Shows score distribution by category with optional sub-grouping"
      }
    },

    bump: {
      description: "Bump charts track ranking changes over time showing how different entities move up or down.",
      example: {
        csvColumns: ["Date", "TeamA_Rank", "TeamB_Rank", "TeamC_Rank"],
        dataMapping: {
          xColumn: "Date",
          seriesColumns: ["TeamA_Rank", "TeamB_Rank", "TeamC_Rank"]
        },
        description: "Shows ranking changes of teams over time"
      }
    },

    bullet: {
      description: "Bullet charts compare actual performance against targets in a compact dashboard format.",
      example: {
        csvColumns: ["Metric", "Actual", "Target", "Poor", "Good"],
        dataMapping: {
          idColumn: "Metric",
          actualColumn: "Actual",
          targetColumn: "Target"
        },
        description: "Shows KPI performance vs targets with background performance ranges"
      }
    },

    funnel: {
      description: "Funnel charts show progression through sequential stages, highlighting conversion rates.",
      example: {
        csvColumns: ["Stage", "Count", "Label"],
        dataMapping: {
          idColumn: "Stage",
          valueColumn: "Count"
        },
        description: "Shows user conversion through different funnel stages"
      }
    },

    stream: {
      description: "Stream charts show how different categories contribute to a total over time.",
      example: {
        csvColumns: ["Date", "ProductA", "ProductB", "ProductC"],
        dataMapping: {
          xColumn: "Date",
          valueColumns: ["ProductA", "ProductB", "ProductC"]
        },
        description: "Shows how product contributions change over time in a flowing stream"
      }
    },

    sunburst: {
      description: "Sunburst charts show hierarchical data in a circular, multi-level pie chart format.",
      example: {
        csvColumns: ["ID", "Parent", "Value", "Category"],
        dataMapping: {
          idColumn: "ID",
          parentColumn: "Parent",
          valueColumn: "Value"
        },
        description: "Shows hierarchical proportions in concentric circles"
      }
    },

    waffle: {
      description: "Waffle charts show proportional data using a grid of squares for easy percentage visualization.",
      example: {
        csvColumns: ["Category", "Percentage", "Count"],
        dataMapping: {
          idColumn: "Category",
          valueColumn: "Percentage"
        },
        description: "Shows category proportions using a 10x10 grid of squares"
      }
    },

    network: {
      description: "Network charts visualize connections and relationships between nodes in a graph structure.",
      example: {
        csvColumns: ["NodeID", "Source", "Target", "Weight"],
        dataMapping: {
          nodeIdColumn: "NodeID",
          linkSourceColumn: "Source",
          linkTargetColumn: "Target",
          linkValueColumn: "Weight"
        },
        description: "Shows network connections with nodes and weighted links"
      }
    },

    radialbar: {
      description: "Radial bar charts display categorical data in a circular format, saving space while comparing values.",
      example: {
        csvColumns: ["Category", "Value", "Score"],
        dataMapping: {
          idColumn: "Category",
          valueColumn: "Value"
        },
        description: "Shows category values in a circular bar chart format"
      }
    },

    swarmplot: {
      description: "Swarm plots show distribution of values with individual data points positioned to avoid overlap.",
      example: {
        csvColumns: ["Group", "Value", "Size", "ID"],
        dataMapping: {
          groupBy: "Group",
          value: "Value",
          size: "Size"
        },
        description: "Shows value distribution by group with individual points in a bee swarm pattern"
      }
    },

    treemap: {
      description: "Treemaps show hierarchical data using nested rectangles with sizes proportional to values.",
      example: {
        csvColumns: ["ID", "Parent", "Value", "Category"],
        dataMapping: {
          idColumn: "ID",
          parentColumn: "Parent",
          valueColumn: "Value"
        },
        description: "Shows hierarchical data as nested rectangles with proportional sizes"
      }
    },

    voronoi: {
      description: "Voronoi diagrams show spatial relationships and territories based on coordinate data.",
      example: {
        csvColumns: ["ID", "X", "Y", "Weight"],
        dataMapping: {
          idColumn: "ID",
          xColumn: "X",
          yColumn: "Y"
        },
        description: "Shows spatial territories and proximity relationships based on point coordinates"
      }
    }
  };
} 