-- Database
-- Note: Do not hardcode database selection here.
-- In Docker, this script runs against MYSQL_DATABASE from docker-compose/.env.
-- For manual imports, select the target database before executing this file.


-- Base Tables (No Dependencies)

CREATE TABLE IF NOT EXISTS Teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    specialization VARCHAR(100),
    description TEXT,
    profile_image VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_teachers_slug (slug),
    INDEX idx_teachers_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(150),
    age INT,
    occupation VARCHAR(100),
    registered_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_user (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_admin_username (username)
) ENGINE=InnoDB;


-- Dependent Tables (Level 1)

CREATE TABLE IF NOT EXISTS Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    level VARCHAR(100),
    price DECIMAL(10,2),
    teacher_id INT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_courses_slug (slug),
    INDEX idx_courses_display_order (display_order),
    INDEX idx_courses_teacher_id (teacher_id),
    INDEX idx_courses_level (level),

    FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Dependent Tables (Level 2)

CREATE TABLE IF NOT EXISTS Gallery (
    gallery_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    thumbnail_image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_gallery_slug (slug),
    INDEX idx_gallery_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Gallery_Images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    gallery_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_gallery_images_gallery_id (gallery_id),
    INDEX idx_gallery_images_display_order (display_order),

    FOREIGN KEY (gallery_id) REFERENCES Gallery(gallery_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Class_Schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT,
    class_day VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    INDEX idx_class_schedule_course_id (course_id),
    INDEX idx_class_schedule_teacher_id (teacher_id),

    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL DEFAULT 'Unread',

    FOREIGN KEY (student_id) REFERENCES Students(student_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subtitle VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    cta_text VARCHAR(120),
    cta_link VARCHAR(500),
    valid_from DATE,
    valid_to DATE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active TINYINT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_offers_slug (slug),
    INDEX idx_offers_course_id (course_id),
    INDEX idx_offers_active (is_active)
) ENGINE=InnoDB;


-- Independent Content Tables

CREATE TABLE IF NOT EXISTS Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category ENUM('upcoming', 'past') DEFAULT 'upcoming',
    description TEXT,
    rich_content LONGTEXT,
    event_date DATE,
    event_time TIME,
    venue VARCHAR(150),
    organized_by VARCHAR(100),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_events_slug (slug),
    INDEX idx_events_display_order (display_order),
    INDEX idx_events_event_date (event_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS News (
    news_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    rich_content LONGTEXT,
    news_date DATE,
    image_url VARCHAR(500),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_news_slug (slug),
    INDEX idx_news_date (news_date),
    INDEX idx_news_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS News_Resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    resource_type ENUM('image', 'youtube'),
    resource_url VARCHAR(1000),
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (news_id) REFERENCES News(news_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- Other Content Tables

CREATE TABLE IF NOT EXISTS activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    video_url VARCHAR(500),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_activities_slug (slug),
    INDEX idx_activities_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    slug VARCHAR(255) UNIQUE,
    bio TEXT,
    profile_image VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_artists_slug (slug),
    INDEX idx_artists_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS BOD (
    bod_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(255) UNIQUE,
    designation VARCHAR(100),
    bio TEXT,
    details_content LONGTEXT,
    profile_image VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bod_slug (slug),
    INDEX idx_bod_updated_at (updated_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_date DATE,
    title VARCHAR(150),
    slug VARCHAR(255) UNIQUE,
    rich_content LONGTEXT,
    image_url VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_programs_slug (slug),
    INDEX idx_programs_display_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Program_Resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    resource_type ENUM('image', 'youtube'),
    resource_url VARCHAR(1000),
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_program_resources_program_id (program_id),
    INDEX idx_program_resources_sort_order (sort_order),

    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    subtitle VARCHAR(200),
    description TEXT,
    image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Admin_Audit_Log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(255),
    entity VARCHAR(100),
    entity_id INT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;



