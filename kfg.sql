-- Delete and recreate kfg db
DROP DATABASE IF EXISTS kfg;
CREATE DATABASE kfg;


-- Connect to kfg db
\c kfg

-- Execute kfg-schema.sql and kfg-seed.sql
\i kfg-schema.sql
\i kfg-seed.sql

-- Delete and recreate kfg_test db
DROP DATABASE IF EXISTS kfg_test;
CREATE DATABASE kfg_test;

-- Connect to kfg_test db
\c kfg_test

-- Execute kfg-schema.sql
\i kfg-schema.sql
