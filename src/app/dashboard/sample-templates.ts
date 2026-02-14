import { ResumeValues } from "@/lib/validation";

export interface SampleTemplate {
    name: string;
    description: string;
    data: ResumeValues;
}

export const sampleTemplates: SampleTemplate[] = [
    // =========================================================================
    // 1. PROFESSIONAL — Matches professional.png (Jacob McLaren)
    //    Layout: single-column, centered name, section headings with HR
    //    Sections: Summary → Education → Work Experience → Technical Expertise
    // =========================================================================
    {
        name: "Professional",
        description: "Classic single-column layout for corporate roles",
        data: {
            title: "Professional Resume",
            layout: "single-column",
            colorHex: "#000000",
            borderStyle: "squircle",
            fontSize: 10,
            fontFamily: "serif",
            summary:
                "Organized computer and English literacy workshops for underprivileged children in South Asia, 2013 Student Scholarship Recipient, National Conference on Race and Ethnicity, 2007-2008",
            firstName: "Jacob",
            lastName: "McLaren",
            jobTitle: "",
            city: "Cambridge",
            country: "MA 02138",
            phone: "555-555-5555",
            email: "mclaren@gmail.com",
            skills: [
                "MS Excel",
                "PowerPoint",
                "Relational Databases",
                "Project Management",
                "Quantitative Analysis",
                "SQL",
                "Java",
            ],
            educations: [
                {
                    school: "Harvard University, Extension School",
                    degree: "Master of Liberal Arts",
                    fieldOfStudy: "Information Management Systems",
                    endDate: "2018-05-01",
                    description:
                        "• Dean's List Academic Achievement Award recipient\n• Relevant coursework: Trends in Enterprise Information Systems, Principles of Finance, Data mining and Forecast Management, Resource Planning and Allocation Management, Simulation for Managerial Decision Making",
                    visible: true,
                },
                {
                    school: "Rutgers, The State University of New Jersey",
                    degree: "Bachelor of Arts",
                    fieldOfStudy: "Computer Science with Mathematics minor",
                    endDate: "2014-05-01",
                    visible: true,
                },
            ],
            workExperiences: [
                {
                    position: "Principal",
                    company: "State Street Corporation",
                    subheading: "Simulated Technology",
                    startDate: "2011-09-01",
                    endDate: "2013-07-01",
                    location: "Boston, MA",
                    description:
                        "• Led 8 cross functional, geographically dispersed teams to support quality for the reporting system\n• Improved process efficiency 75% by standardizing end to end project management workflow\n• Reduced application testing time 30% by automating shorter testing phases for off cycle projects\n• Conducted industry research on third-party testing tools and prepared recommendations for maximum return on investment",
                    visible: true,
                },
                {
                    position: "Associate",
                    company: "Fidelity Investments",
                    subheading: "Interactive Technology",
                    startDate: "2010-01-01",
                    endDate: "2011-09-01",
                    location: "Boston, MA",
                    description:
                        "• Implemented initiatives to reduce overall project time frames by involving quality team members early in the Software Development Life Cycle iterations\n• Developed a systematic approach to organize and document the requirements of the to-be-system\n• Provided leadership to off-shore tech teams via training and analyzing business requirements",
                    visible: true,
                },
                {
                    position: "Associate",
                    company: "Fidelity Investments",
                    subheading: "Interactive Technology",
                    startDate: "2010-07-01",
                    endDate: "2011-01-01",
                    location: "Singapore",
                    description:
                        "• Built Command & Control System for Singapore Civil Defence Force using C# .NET WCF Services\n• Integrated proprietary software components with commercial off-the-shell software product",
                    visible: true,
                },
            ],
            sectionOrder: [
                "personal-info",
                "profile",
                "education",
                "experience",
                "skills",
            ],
        },
    },

    // =========================================================================
    // 2. CREATIVE — Matches creative.png (Sarah Watson)
    //    Layout: two-column, purple sidebar (left: name, photo, contact, skills
    //    bars, languages, favorite quote), right: summary, experience, education,
    //    interests
    // =========================================================================
    {
        name: "Creative",
        description: "Bold two-column layout with colorful sidebar",
        data: {
            title: "Creative Resume",
            layout: "two-column",
            colorHex: "#6B5B95",
            borderStyle: "circle",
            fontSize: 10,
            fontFamily: "serif",
            summary:
                "Driven and enthusiastic Web Developer with a strong passion for creating exceptional web experiences. Experienced in manual testing, test automation, tracking tools, and A/B testing. Quick learner, team player, and effective communicator. Proficient in Continuous Delivery tools. Familiar with Java and JSP.",
            firstName: "Sarah",
            lastName: "Watson",
            jobTitle: "Web Developer",
            city: "New York",
            country: "USA",
            phone: "+123235245",
            email: "hello@watson.org",
            skills: [
                "JavaScript",
                "TypeScript",
                "HTML 5 and CSS 3",
                "React.js",
                "Next.js",
                "Storybook",
            ],
            workExperiences: [
                {
                    position: "Web Developer",
                    company: "Google Inc.",
                    startDate: "2018-05-01",
                    location: "Mountain View, California",
                    description:
                        "Developed responsive and user-friendly websites utilizing HTML, CSS, and JavaScript resulting in improved user engagement and a 30% increase in site traffic. Collaborated with design and marketing teams to implement visual and interactive elements, resulting in visually stunning and highly functional websites.",
                    visible: true,
                },
                {
                    position: "Junior Developer",
                    company: "Wing Aviation LLC",
                    startDate: "2016-09-01",
                    endDate: "2018-04-01",
                    location: "Mountain View, California",
                    description:
                        "Assisted in the development of front-end and back-end components for corporate websites, contributing to a 15% improvement in site usability. Collaborated with the development team to troubleshoot and resolve coding issues, resulting in a 10% reduction in application errors.",
                    visible: true,
                },
            ],
            educations: [
                {
                    school: "San Francisco Bay University",
                    degree: "Bachelor of Science",
                    fieldOfStudy: "Computer Science",
                    startDate: "2014-09-01",
                    endDate: "2018-06-01",
                    visible: true,
                },
            ],
            interests: [
                { name: "Travelling", visible: true },
                { name: "Playing Guitar", visible: true },
            ],
            languages: [
                { language: "English", proficiency: "Fluent", visible: true },
                {
                    language: "Spanish",
                    proficiency: "Conversational",
                    visible: true,
                },
            ],
            sectionOrder: [
                "personal-info",
                "profile",
                "experience",
                "education",
                "skills",
                "languages",
                "interests",
            ],
        },
    },

    // =========================================================================
    // 3. MODERN — Matches modern.png (Elio Giordano)
    //    Layout: two-column, photo+name header spanning top, left column:
    //    Education, Skills (categorized), Languages. Right column: Work
    //    Experience, Projects. Orange (#D97706) accent color.
    // =========================================================================
    {
        name: "Modern",
        description: "Clean two-column layout with photo header",
        data: {
            title: "Modern Resume",
            layout: "two-column",
            colorHex: "#D97706",
            borderStyle: "squircle",
            fontSize: 10,
            fontFamily: "serif",
            summary: "",
            firstName: "Elio",
            lastName: "Giordano",
            jobTitle: "Full-Stack Web Developer",
            city: "Bologna",
            country: "Italy",
            phone: "+39 348 123 4567",
            email: "elio.giordano.dev@email.com",
            linkedin: "linkedin.com/in/elio-giordano-dev",
            website: "eliog.dev",
            skills: [
                "Java",
                "JavaScript",
                "TypeScript",
                "HTML5",
                "CSS3",
                "Spring Boot",
                "Thymeleaf",
                "React",
                "Node.js",
                "Express.js",
                "Object-Oriented Programming (OOP)",
                "Full-Stack Web Development",
                "Relational Databases",
                "Git",
                "Adobe Creative Suite",
            ],
            workExperiences: [
                {
                    position: "Warehouse Associate",
                    company: "Global Logistics Solutions",
                    startDate: "2024-09-01",
                    endDate: "2024-12-01",
                    location: "Modena, Italy",
                    description:
                        "• Order Picking: Accurately and efficiently retrieved items from shelving systems to meet daily fulfillment targets.\n• Indirect Logistics: Handled support tasks including stock replenishment, workstation organization, and maintaining a clean warehouse environment.\n• Inventory Management: Utilized RFID devices and scanners for real-time tracking of warehouse inventory movements.\n• Safety and Quality: Consistently adhered to company safety regulations and quality assurance protocols.",
                    visible: true,
                },
                {
                    position: "Kitchen Assistant & Dishwasher",
                    company: "Trattoria del Sole",
                    startDate: "2024-03-01",
                    endDate: "2024-08-01",
                    location: "Bologna, Italy",
                    description:
                        "• Washed and sanitized dishes, glassware, and kitchen equipment.\n• Assisted chefs with preliminary food preparation tasks.\n• Maintained cleanliness and order in the kitchen and work areas.\n• Followed all hygiene and safety standards.",
                    visible: true,
                },
            ],
            educations: [
                {
                    school: "CodeCrafters Academy",
                    degree: "Full-Stack Web Development",
                    startDate: "2025-01-01",
                    endDate: "2025-08-01",
                    location: "Remote",
                    description:
                        "• Completed an intensive 7-month program focused on full-stack web development and modern programming methodologies.\n• Acquired advanced skills in Java, Spring Boot, JavaScript, HTML, and CSS.\n• Developed practical projects to build complete web applications, following best practices and OOP principles.",
                    visible: true,
                },
                {
                    school: "Istituto Tecnico Galileo Ferraris",
                    degree: "Diploma",
                    fieldOfStudy: "Graphic Design and Communication",
                    startDate: "2019-09-01",
                    endDate: "2024-06-01",
                    visible: true,
                },
            ],
            projects: [
                {
                    title: "CineVerse Explorer",
                    subtitle:
                        "A full-stack application for discovering and rating cinematic content.",
                    description:
                        "• Developed a responsive web application with React and TypeScript for advanced movie searching, integrated with the CinemaData API.\n• Implemented a real-time search system with multiple dynamic filters (genre, rating, release year) for seamless navigation.\n• Optimized performance through efficient API calls with client-side caching and intelligent request handling using Axios.\n• Designed a modern user interface with Tailwind CSS, ensuring a consistent and accessible cross-device experience.",
                    visible: true,
                },
                {
                    title: "ConnectSphere Chat",
                    subtitle:
                        "A full-stack app enabling real-time messaging between registered users.",
                    description:
                        "• Engineered a bidirectional real-time messaging system using Socket.IO for instant communication.\n• Implemented secure authentication and session management with a Node.js backend and a MongoDB database.\n• Integrated global state management with Zustand for efficient synchronization between the UI and real-time data.\n• Developed a responsive and accessible user interface with DaisyUI, enhancing overall usability and user experience.",
                    visible: true,
                },
                {
                    title: "MythosGuess",
                    subtitle:
                        "A daily guessing game to identify characters from the 'Chronicles of Aethel' fantasy book series.",
                    description:
                        "• Conceived and developed a deduction game with mechanics inspired by Wordle, set in the 'Chronicles of Aethel' universe.\n• Implemented an interactive interface with progressive visual feedback and a contextual hint system.\n• Developed validation algorithms for handling user input and game logic.\n• Optimized the user experience through a streamlined game flow and intuitive interactions to maximize engagement.",
                    visible: true,
                },
            ],
            languages: [
                { language: "Italian", proficiency: "Native", visible: true },
                {
                    language: "English",
                    proficiency: "Professional Working Proficiency",
                    visible: true,
                },
            ],
            sectionOrder: [
                "personal-info",
                "education",
                "skills",
                "languages",
                "experience",
                "projects",
            ],
        },
    },

    // =========================================================================
    // 4. SIMPLE — Matches simple.png (Andrew O'Sullivan)
    //    Layout: split-date, dates in left margin column
    //    Sections: Profile → Professional Experience → Education → Skills (dot
    //    rating) → Languages → Awards → Favorite Quote
    // =========================================================================
    {
        name: "Simple",
        description: "Elegant split-date layout with left-margin dates",
        data: {
            title: "Simple Resume",
            layout: "split-date",
            colorHex: "#111827",
            borderStyle: "squircle",
            fontSize: 10,
            fontFamily: "serif",
            summary:
                "Experienced Product Manager with a proven track record in the development and management of products throughout their lifecycle. Passionate, creative, and results-oriented.",
            firstName: "Andrew",
            lastName: "O'Sullivan",
            jobTitle: "Product Manager",
            city: "Berlin",
            country: "Germany",
            phone: "+01 11111155",
            email: "andrew@sulli.com",
            linkedin: "andrewosulvian",
            skills: [
                "Product development and strategy",
                "Customer needs analysis and market research",
                "Data analysis",
                "Project management and team leadership",
                "Agile methods and Scrum",
                "Presentation and communication",
            ],
            workExperiences: [
                {
                    position: "Product Manager",
                    company: "Technite Gmbh",
                    startDate: "2018-08-01",
                    endDate: "2023-07-01",
                    location: "Berlin, Germany",
                    description:
                        "• Led a cross-functional team of 10 people in the development of a new product line, resulting in a 20% increase in revenue\n• Conducted market analysis and competitive studies to identify new product opportunities and expand the product portfolio\n• Successfully launched two new products in the market, leading to a 15% increase in market share",
                    visible: true,
                },
                {
                    position: "Product Specialist",
                    company: "Solutions Inc",
                    startDate: "2015-04-01",
                    endDate: "2018-07-01",
                    location: "Munich, Germany",
                    description:
                        "• Developed and implemented a product strategy for the European market, resulting in a 25% revenue growth\n• Conducted training sessions and presentations for customers and sales teams to enhance product knowledge",
                    visible: true,
                },
            ],
            educations: [
                {
                    school: "University",
                    degree: "Master of Business Administration (MBA)",
                    startDate: "2013-08-01",
                    endDate: "2015-07-01",
                    location: "Munic, Gemany",
                    visible: true,
                },
                {
                    school: "Technical University",
                    degree: "Bachelor of Engineering",
                    fieldOfStudy: "Information Technology",
                    startDate: "2009-09-01",
                    endDate: "2013-07-01",
                    location: "Vienna, Austria",
                    visible: true,
                },
            ],
            languages: [
                { language: "German", proficiency: "Native", visible: true },
                { language: "English", proficiency: "Fluent", visible: true },
                {
                    language: "Spanish",
                    proficiency: "Basic",
                    visible: true,
                },
            ],
            awards: [
                {
                    title: "Product Manager of the Year",
                    issuer: "Delta Solutions",
                    visible: true,
                },
            ],
            sectionOrder: [
                "personal-info",
                "profile",
                "experience",
                "education",
                "skills",
                "languages",
                "awards",
            ],
        },
    },
];
