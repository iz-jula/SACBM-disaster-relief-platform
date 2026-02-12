-- Populate INGD relief requests from the General Needs List
-- Execute this SQL directly in your Supabase dashboard

INSERT INTO INGD_table (originator, email, full_name, location, partner_organisation, help_type, evacuation_type, people, value, status, created_at) VALUES

-- Produtos Alimentares (Food Products)
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Rice (25kg)', 'By truck', '84975', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Rice (25kg)', 'By truck', '311225', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Rice (25kg)', 'By truck', '6900', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Rice (25kg)', 'By truck', '2000', '405100', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Corn Flour (25kg)', 'By truck', '84975', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Corn Flour (25kg)', 'By truck', '311225', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Corn Flour (25kg)', 'By truck', '6900', '405100', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Corn Flour (25kg)', 'By truck', '2000', '405100', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Beans (5kg)', 'By truck', '16995', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Beans (5kg)', 'By truck', '62245', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Beans (5kg)', 'By truck', '1380', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Beans (5kg)', 'By truck', '400', '81020', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Oil (2Litres)', 'By truck', '6798', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Oil (2Litres)', 'By truck', '24898', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Oil (2Litres)', 'By truck', '552', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Oil (2Litres)', 'By truck', '160', '32408', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Sugar (3kg)', 'By truck', '10197', '48612', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Sugar (3kg)', 'By truck', '37347', '48612', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Sugar (3kg)', 'By truck', '828', '48612', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Sugar (3kg)', 'By truck', '240', '48612', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Salt (1kg)', 'By truck', '3399', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Salt (1kg)', 'By truck', '12449', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Salt (1kg)', 'By truck', '276', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Salt (1kg)', 'By truck', '80', '16204', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Soap (500g)', 'By truck', '16995', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Soap (500g)', 'By truck', '62245', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Soap (500g)', 'By truck', '1380', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Soap (500g)', 'By truck', '400', '81020', false, NOW()),

-- Produtos de Higiene e Saúde (Hygiene and Health Products)
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Hygiene Kit', 'By truck', '3399', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Hygiene Kit', 'By truck', '12449', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Hygiene Kit', 'By truck', '276', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Hygiene Kit', 'By truck', '80', '16204', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Dignity Kit', 'By truck', '3399', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Dignity Kit', 'By truck', '12449', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Dignity Kit', 'By truck', '276', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Dignity Kit', 'By truck', '80', '16204', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Chlorine Tablets', 'By truck', '3399', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Chlorine Tablets', 'By truck', '12449', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Chlorine Tablets', 'By truck', '276', '16204', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Chlorine Tablets', 'By truck', '80', '16204', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Mineral Water (1.5L)', 'By truck', '50985', '243060', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Mineral Water (1.5L)', 'By truck', '186735', '243060', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Mineral Water (1.5L)', 'By truck', '4140', '243060', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Mineral Water (1.5L)', 'By truck', '1200', '243060', false, NOW()),

-- Bens de Emergência Familiar (Emergency Family Goods)
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Family Tent', 'By truck', '1700', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Family Tent', 'By truck', '6225', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Family Tent', 'By truck', '138', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Family Tent', 'By truck', '40', '8102', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Plastic Sheet', 'By truck', '1700', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Plastic Sheet', 'By truck', '6225', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Plastic Sheet', 'By truck', '138', '8102', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Plastic Sheet', 'By truck', '40', '8102', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Blanket', 'By truck', '6798', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Blanket', 'By truck', '24898', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Blanket', 'By truck', '552', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Blanket', 'By truck', '160', '32408', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Mattress', 'By truck', '6798', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Mattress', 'By truck', '24898', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Mattress', 'By truck', '552', '32408', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Mattress', 'By truck', '160', '32408', false, NOW()),

('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Maputo', 'INGD', 'Cooking Pot', 'By truck', '16995', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Gaza', 'INGD', 'Cooking Pot', 'By truck', '62245', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Sofala', 'INGD', 'Cooking Pot', 'By truck', '1380', '81020', false, NOW()),
('INGD', 'ingd@gov.mz', 'National Disaster Institute', 'Zambézia', 'INGD', 'Cooking Pot', 'By truck', '400', '81020', false, NOW());
