const { Client } = require("pg");
const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
        FROM users;
        `
  );

  return rows;
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `SELECT id, 'authorId', title, content, active
            FROM posts;
            `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
      `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
    const {rows} = await client.query(`SELECT * FROM users WHERE id=${userId}`)
    if (rows.length === 0) {
        return null
    }
    delete rows.password
    const userPosts = await getPostsByUser(userId)
    rows.posts = userPosts
    return rows

  }

async function createPost({ authorId, title, content }) {
  try {

    const { rows } = await client.query(
      `
        INSERT INTO posts("authorId", title, content) VALUES ($1, $2, $3);
        `,
      [authorId, title, content]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, location) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING RETURNING *;
        `,
      [username, password, name, location]
    );

    console.log("This is the user", user);

    return user;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = { title, content, active }) {
    console.log("Updating post")
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }
  try {
    const result = await client.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return result;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const result = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return result;
  } catch (error) {
    throw error;
  }
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });

      await createPost({
        authorId: sandra.id,
        title: "Second Post",
        content: "This is my second post. I hope I love writing blogs as much as I love writing them."
      });

      await createPost({
        authorId: glamgal.id,
        title: "Thirs Post",
        content: "This is my third post. I hope I love writing blogs as much as I love writing them."
      });
  
    } catch (error) {
      throw error;
    }
  }

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  updatePost,
  getUserById,
  createInitialPosts
};
