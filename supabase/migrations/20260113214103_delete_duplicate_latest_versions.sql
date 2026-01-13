-- Delete duplicate latest versions where the highest version is identical to the previous version
-- Affects 2 prompts identified during UAT:
-- 1. "Clear, Install, Build, Everything Else, and Dev" - v4 duplicates v3
-- 2. "Implement Features Step by Step for CC based on plan" - v3 duplicates v2

DELETE FROM prompt_versions
WHERE (prompt_id = '2f1b06b6-956f-4e26-a7f6-4efbd560fa56' AND version_number = 4)
   OR (prompt_id = 'd13b8a53-78a9-402a-9be8-b228d08bcf58' AND version_number = 3);
