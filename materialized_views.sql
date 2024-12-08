--MATERIALIZED VIEWS MAINTENANCE LOG

DROP MATERIALIZED VIEW IF EXISTS mv_maintenance_log_monthly_keping_roda_avg;
CREATE MATERIALIZED VIEW mv_maintenance_log_monthly_keping_roda_avg AS
select
	uuid_generate_v4() AS id,
	date_trunc('month',
	ml."created_at") as month_year,
	a.name as asset_name,
	g.name as gerbong,
	t.name as train_set,
	b.name as bogie,
	b."bogie" as bogie_type,
	JSON_AGG(
        JSON_BUILD_OBJECT(
            'diameter',
	(ml."paramsValue"->>'diameter')::DOUBLE precision,
	'flank',
	(ml."paramsValue"->>'fence')::DOUBLE precision,
	'created_at',
	ml."created_at"
        )
    ) as details,
	AVG((ml."paramsValue"->>'diameter')::DOUBLE precision) as avg_diameter,
	AVG((ml."paramsValue"->>'fence')::DOUBLE precision) as avg_flank,
	ml.program as program,
	COUNT(*) AS total_records
from
	public.maintenance_log ml
left join
    public.asset a on
	ml."assetId" = a.id
left join 
        public.asset g on
	ml."gerbongAssetId" = g.id
left join 
        public.asset t on
	g."parentAssetId" = t.id
left join 
        public.asset b on
	ml."parentAssetId" = b.id
where
	ml."asset_type" = 'Keping Roda'
	and ml."gerbongAssetId" is not null
	and ml."parentAssetId" is not null
group by
	date_trunc('month',
	ml."created_at"),
	ml.program,
	a.name,
	g.name,
	t.name,
	b.name,
	b."bogie"
order by
	month_year;
	
DROP MATERIALIZED VIEW IF EXISTS mv_maintenance_log_bogie_avg;
DROP MATERIALIZED VIEW IF EXISTS mv_maintenance_log_monthly_avg;

CREATE MATERIALIZED VIEW mv_maintenance_log_monthly_avg AS
WITH bogie_avg AS (
    SELECT
        date_trunc('month', ml."created_at") AS month_year,
        g.name AS gerbong,
        t.name AS train_set,
        b.name AS bogie,
        b."bogie" AS bogie_type,
        AVG((ml."paramsValue"->>'diameter')::DOUBLE PRECISION) AS avg_diameter, -- Average diameter
        AVG((ml."paramsValue"->>'fence')::DOUBLE PRECISION) AS avg_flens,       -- Average flank
        COUNT(*) AS total_records,
        ml.program as program -- Count total rows
    FROM 
        public.maintenance_log ml
    LEFT JOIN 
        public.asset g ON ml."gerbongAssetId" = g.id
    LEFT JOIN 
        public.asset t ON g."parentAssetId" = t.id
    LEFT JOIN 
        public.asset b ON ml."parentAssetId" = b.id
    WHERE 
        ml."asset_type" = 'Keping Roda' 
        AND ml."gerbongAssetId" IS NOT NULL 
        AND ml."parentAssetId" IS NOT NULL
    GROUP BY 
        date_trunc('month', ml."created_at"),
        g.name, t.name, b.name, b."bogie", ml.program
)
select
	uuid_generate_v4() AS id,
    month_year,
    train_set,
    gerbong,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'bogie', bogie,
            'bogie_type', bogie_type,
            'avg_diameter', avg_diameter,
            'avg_flens', avg_flens,
            'total_records', total_records -- Include total records in the JSON object
        )
    ) AS details,
    program,
    SUM(total_records) AS total_count -- Total count of all records for this group
FROM 
    bogie_avg
GROUP BY 
    month_year, gerbong, train_set, program;
   
   
--DROP MATERIALIZED VIEW IF EXISTS mv_maintenance_log_bogie_avg;
--CREATE MATERIALIZED VIEW mv_maintenance_log_bogie_avg AS
WITH 
    expanded_data AS (
        SELECT
            date_trunc('month', ml."month_year") AS month_year,
            jsonb_array_elements(ml.details::JSONB) AS detail,
            total_count 
        FROM
            public.mv_maintenance_log_monthly_avg ml
    ),
    averages AS (
        SELECT
            month_year,
            detail->>'bogie_type' AS bogie_type,
            AVG((detail->>'avg_diameter')::DOUBLE PRECISION) AS avg_diameter,
            AVG((detail->>'avg_flens')::DOUBLE PRECISION) AS avg_flens,
            SUM(total_count) as total_count
        FROM
            expanded_data
        GROUP BY
            month_year, bogie_type
    )
select
gen_random_uuid() AS uuid,
    month_year,
    total_count,
    jsonb_object_agg(bogie_type, jsonb_build_object('avg_diameter', avg_diameter, 'avg_flens', avg_flens)) as avg
FROM
    averages
GROUP BY
    month_year, total_count;

