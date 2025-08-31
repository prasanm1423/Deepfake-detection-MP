# Enhanced Database Setup Guide

This guide will help you set up the enhanced database schema that includes comprehensive analysis history storage.

## 🚀 Quick Setup

### 1. Run the Enhanced Schema

Copy and paste the entire contents of `database_schema_enhanced.sql` into your Supabase SQL Editor and execute it.

### 2. What's New

The enhanced schema adds:

- **Comprehensive Analysis History Table**: Stores complete analysis results
- **Advanced Statistics Functions**: Get user analysis statistics
- **Search and Filter Capabilities**: Find analyses by various criteria
- **Performance Optimizations**: Indexes for fast queries
- **Row Level Security**: Secure data access

## 📊 Database Structure

### Analysis History Table

```sql
analysis_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    analysis_type TEXT, -- 'image', 'video', 'audio'
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    is_deepfake BOOLEAN,
    confidence DECIMAL(5,4),
    risk_level TEXT, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence_category TEXT,
    analysis_quality TEXT,
    analysis_time INTEGER,
    api_provider TEXT,
    models_used TEXT[],
    quality_score DECIMAL(3,2),
    processing_details JSONB,
    recommendations TEXT[],
    limitations TEXT[],
    metadata JSONB,
    image_analysis JSONB,
    video_analysis JSONB,
    audio_analysis JSONB,
    raw_response JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Key Features

1. **Complete Data Storage**: All analysis details are preserved
2. **JSONB Fields**: Flexible storage for complex data structures
3. **Type-Specific Analysis**: Separate fields for image, video, and audio analysis
4. **Audit Trail**: Created and updated timestamps
5. **Performance Indexes**: Fast queries on common fields

## 🔧 Functions Available

### Get User Statistics
```sql
SELECT * FROM get_user_analysis_stats('user-uuid');
```

### Get Recent Analyses
```sql
SELECT * FROM get_recent_analyses('user-uuid', 10);
```

### Get Analyses by Date Range
```sql
SELECT * FROM get_analyses_by_date_range(
    'user-uuid', 
    '2024-01-01'::timestamp, 
    '2024-12-31'::timestamp
);
```

## 🔒 Security

- **Row Level Security (RLS)**: Users can only access their own data
- **Policy-Based Access**: Granular control over data access
- **Audit Trail**: Track all data modifications

## 📈 Performance

### Indexes Created
- `idx_analysis_history_user_id`: Fast user-specific queries
- `idx_analysis_history_created_at`: Date-based sorting
- `idx_analysis_history_type`: Filter by analysis type
- `idx_analysis_history_is_deepfake`: Filter by result
- `idx_analysis_history_risk_level`: Filter by risk level

### Query Optimization
- Pagination support with `LIMIT` and `OFFSET`
- Efficient filtering with indexed columns
- JSONB queries for complex data

## 🚀 Usage in Application

### Save Analysis to History
```typescript
const result = await saveAnalysisToHistory({
  analysis_type: 'image',
  file_name: 'photo.jpg',
  is_deepfake: false,
  confidence: 0.95,
  // ... other fields
});
```

### Get User History
```typescript
const history = await getUserAnalysisHistory(50, 0);
```

### Get Statistics
```typescript
const stats = await getUserAnalysisStats();
```

### Search Analyses
```typescript
const results = await searchAnalyses('photo', 20);
```

## 🔄 Migration from Old Schema

If you have existing data in the `user_usage` table, you can migrate it:

```sql
-- Migrate existing usage data to analysis history
INSERT INTO analysis_history (
    user_id, analysis_type, file_size, is_deepfake, 
    confidence, analysis_time, api_provider, created_at
)
SELECT 
    user_id, analysis_type, file_size, is_deepfake,
    confidence, analysis_time, api_provider, created_at
FROM user_usage;
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure RLS policies are correctly set
2. **Function Not Found**: Make sure all functions are created
3. **Index Errors**: Check if indexes already exist

### Verification

Run these queries to verify setup:

```sql
-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'analysis_history'
);

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'get_user%';

-- Test RLS policies
SELECT * FROM analysis_history LIMIT 1;
```

## 📝 Next Steps

1. **Test the Setup**: Run a few analyses and check the history
2. **Monitor Performance**: Watch query performance with real data
3. **Backup Strategy**: Set up regular database backups
4. **Scaling**: Consider partitioning for large datasets

## 🔗 Related Files

- `database_schema_enhanced.sql`: Enhanced database schema
- `client/lib/supabase.ts`: Updated client functions
- `client/pages/AnalysisHistory.tsx`: History page component
- `client/pages/Dashboard.tsx`: Updated dashboard with history link

---

**Note**: This enhanced schema is backward compatible with the existing `user_usage` table. Both tables can coexist, with `user_usage` handling usage tracking and `analysis_history` providing comprehensive analysis storage.
