// models/aboutModel.js
import db from "../config/db.js";

const AboutModel = {
  // ===== BOD =====
  getAllBOD: async () => {
    const [rows] = await db.query("SELECT * FROM BOD ORDER BY bod_id ASC");
    return rows;
  },

  getBODById: async (id) => {
    const [rows] = await db.query("SELECT * FROM BOD WHERE bod_id = ?", [id]);
    return rows[0];
  },

  createBOD: async (data) => {
    const { name, designation, bio, profile_image } = data;
    const [result] = await db.query(
      "INSERT INTO BOD (name, designation, bio, profile_image) VALUES (?, ?, ?, ?)",
      [name, designation, bio, profile_image || null]
    );
    return result.insertId;
  },

  updateBOD: async (id, data) => {
    const { name, designation, bio, profile_image } = data;
    
    // Build update query dynamically to only update fields that are provided
    const updates = [];
    const values = [];
    
    updates.push('name = ?');
    values.push(name);
    updates.push('designation = ?');
    values.push(designation);
    updates.push('bio = ?');
    values.push(bio);
    
    // Only update profile_image if a new one is provided
    if (profile_image !== undefined) {
        updates.push('profile_image = ?');
        values.push(profile_image || null);
    }
    
    values.push(id);
    
    const [result] = await db.query(
        `UPDATE BOD SET ${updates.join(', ')} WHERE bod_id = ?`,
        values
    );
    
    if (result.affectedRows === 0) throw new Error("BOD member not found.");
},

  deleteBOD: async (id) => {
    const [result] = await db.query("DELETE FROM BOD WHERE bod_id = ?", [id]);
    if (result.affectedRows === 0) throw new Error("BOD member not found.");
  },


  
  //Team members 
  getAllTeamMembers: async () => {
    const [rows] = await db.query("SELECT * FROM team_members ORDER BY id ASC");
    return rows;
  },

  getTeamMemberById: async (id) => {
    const [rows] = await db.query("SELECT * FROM team_members WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  createTeamMember: async (data) => {
    const { name, subtitle, description, image_url } = data;

    const [result] = await db.query(
      "INSERT INTO team_members (name, subtitle, description, image_url) VALUES (?, ?, ?, ?)",
      [name, subtitle, description, image_url || null]
    );

    return result.insertId;
  },

  updateTeamMember: async (id, data) => {
    const { name, subtitle, description, image_url } = data;
    
    const updates = [];
    const values = [];
    
    updates.push('name = ?');
    values.push(name);
    updates.push('subtitle = ?');
    values.push(subtitle || null);
    updates.push('description = ?');
    values.push(description || null);
    
    // Only update image_url if a new one is provided
    if (image_url !== undefined) {
        updates.push('image_url = ?');
        values.push(image_url || null);
    }
    
    values.push(id);

    const [result] = await db.query(
        `UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    if (result.affectedRows === 0) throw new Error("Team Member not found.");
},

  deleteTeamMember: async (id) => {
    const [result] = await db.query("DELETE FROM team_members WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) throw new Error("Team Member not found.");
  },
  // ===== PROGRAMS =====
getAllPrograms: async () => {
  const [rows] = await db.query("SELECT * FROM Programs ORDER BY program_date DESC");
  return rows;
},

getProgramById: async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM Programs WHERE program_id = ?",
    [id]
  );
  return rows[0];
},

getProgramBySlug: async (slug) => {
  const [rows] = await db.query(
    "SELECT * FROM Programs WHERE slug = ?",
    [slug]
  );
  return rows[0] || null;
},

createProgram: async (data) => {
  const { program_date, title, slug, description, image_url, seo_title, seo_description, seo_keywords } = data;
  const [result] = await db.query(
    "INSERT INTO Programs (program_date, title, slug, description, image_url, seo_title, seo_description, seo_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      program_date,
      title,
      slug,
      description,
      image_url || null,
      seo_title || null,
      seo_description || null,
      seo_keywords || null,
    ]
  );
  return result.insertId;
},

updateProgram: async (id, data) => {
  const { program_date, title, slug, description, image_url, seo_title, seo_description, seo_keywords } = data;
  
  const updates = [];
  const values = [];
  
  updates.push('program_date = ?');
  values.push(program_date);
  updates.push('title = ?');
  values.push(title);
  updates.push('slug = ?');
  values.push(slug);
  updates.push('description = ?');
  values.push(description);
  updates.push('seo_title = ?');
  values.push(seo_title || null);
  updates.push('seo_description = ?');
  values.push(seo_description || null);
  updates.push('seo_keywords = ?');
  values.push(seo_keywords || null);
  
  // Only update image_url if a new one is provided
  if (image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(image_url || null);
  }
  
  values.push(id);
  
  const [result] = await db.query(
    `UPDATE Programs SET ${updates.join(', ')} WHERE program_id = ?`,
    values
  );
  
  if (result.affectedRows === 0) throw new Error("Program not found.");
},

deleteProgram: async (id) => {
  const [result] = await db.query(
    "DELETE FROM Programs WHERE program_id = ?",
    [id]
  );
  if (result.affectedRows === 0) throw new Error("Program not found.");
},
};

export default AboutModel;
