INSERT INTO users (username, "password", firstname, lastname, email, isAdmin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'codebangbang24@gmail.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'ryfair@gmail.com',
        TRUE),
        ('joemama',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvZW1hbWEiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3MjI0NjU1NTl9.vvOhMynTaLB3tUJlFnBr0bWvEHVYq0tCwc_Ybo89T5Q',
        'Joe',
        'Mama',
        'joemama@gmail.com',
        TRUE);
        

INSERT INTO employees (firstname, lastname, email, extension, ms_teams_link, department, office_location)
VALUES ('Ryan','Fair','ryan.fair@korhorn.com',133,'ryan.fair@korhorn.com','Tax', 'Granger'),
        ('Summer','Hathaway','summer.hathaway@korhorn.com',111,'summer.hathaway@korhorn.com','Systems & Operations','Edwardsburg'),
        ('Phil','Fletcher','phil.fletcher@korhorn.com',122,'phil.fletcher@korhorn.com','Systems & Operations','Edwardsburg'),
        ('Jay','Ulbricht','jay.ulbricht@korhorn.com',144,'jay.ulbricht@korhorn.com','Tax', 'Granger'),
        ('Holden','Price','holden.price@korhorn.com',155,'holden.price@korhorn.com','Wealth Management', 'Granger'),
        ('Alysia','Boehner','alysia.boehner@korhorn.com',166,'alysia.boehner@korhorn.com','P&C Insurance','Nappanee'),
        ('Ben','Bulgrien','ben.bulgrien@korhorn.com',177,'ben.bulgrien@korhorn.com','Health Insurance', 'Granger'),
        ('Rachelle','Hillebrand','rachelle.hillebrand@korhorn.com',188,'rachelle.hillebrand@korhorn.com','Business Services','Edwardsburg');

INSERT INTO skills (skill_name,"description")
VALUES ('Tax Preparation (1040)','Individual Income Tax Preparation'),
        ('Tax Preparation (1041)','Trust and Estate Income Tax Preparation'),
        ('Tax Preparation (1065)','Partnership Income Tax Preparation'),
        ('Tax Preparation (1120)','C-Corporation Income Tax Preparation'),
        ('Tax Preparation (1120-S)','S-Corportion Income Tax Preparation'),
        ('Tax Preparation (990)','Non-Profit Income Tax Preparation'),
        ('Payroll',NULL),
        ('Accounting',NULL),
        ('QuickBooks',NULL),
        ('Retirement Plan Setup',NULL),
        ('Property and Casualty Service',NULL),
        ('Property and Casualty New Business',NULL),
        ('Health Insurance New Buiness',NULL),
        ('Financial Planning',NULL),
        ('Tax Projections',NULL);

INSERT INTO employee_skills (employee_id,skill_id)
VALUES (1,1),
        (1,2),
        (1,3),
        (1,4),
        (1,5),
        (1,6),
        (2,7),
        (2,8),
        (2,9),
        (2,10),
        (3,7),
        (3,8),
        (3,9),
        (3,10),
        (4,1),
        (4,2),
        (4,3),
        (4,4),
        (4,5),
        (4,6),
        (5,11),
        (5,12),
        (5,13),
        (5,14),
        (6,11),
        (6,12),
        (6,13),
        (6,14),
        (7,11),
        (7,12),
        (7,13),
        (7,14),
        (8,11),
        (8,12),
        (8,13),
        (8,14);