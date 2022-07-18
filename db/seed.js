const { client, getAllUsers, createUser, updateUser, getAllPosts, updatePost, createInitialPosts, getUserById, addTagsToPost, createTags, getPostById } = require('./index');

async function testDB() {
    try {
      console.log("Starting to test database...");
  
      console.log("Calling getAllUsers");
      const users = await getAllUsers();
      console.log("Result:", users);
  
      console.log("Calling updateUser on users[0]");
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
      console.log("Result:", posts);
  
      console.log("Calling updatePost on posts[0]");
      const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
      });

      console.log("Result:", updatePostResult);

      console.log("Calling updatePost on posts[1], only updating tags");
      const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);
  
      console.log("Calling getUserById with 1");
      const albert = await getUserById(1);
      console.log("Result:", albert);

      console.log("Calling getPostsByTagName with #happy");
      const postsWithHappy = await getPostsByTagName("#happy");
      console.log("Result:", postsWithHappy);
  
      console.log("Finished database tests!");
    } catch (error) {
      console.log("Error during testDB");
      throw error;
    }
  }

async function dropTables(){
    try{
        console.log("Starting to drop tables...");
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);
        console.log('finish dropping tables');
    }catch (error){
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTables(){
    try{
        console.log("starting to build tables...");
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active BOOLEAN DEFAULT true);
        `);
        await client.query(`
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY UNIQUE NOT NULL,
            "authorId" INTEGER REFERENCES users(id),
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true);
        `);
        await client.query(`
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY UNIQUE NOT NULL,
            name varchar(255) UNIQUE NOT NULL);
        `);
        await client.query(`
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id));
        `)
        console.log("finish building tables");
    }catch (error){
        console.error('error building tables');
        throw error;
    }
}

async function createInitialUsers(){
    try {

        console.log("Starting to create users...")

        await createUser({username: "albert", password: "albert423", name:'albert', location:'mexico'});
        
        await createUser({username: "sandra", password: "sandra123", name:'sandra', location:'usa'});
        
        await createUser({username: "glamgal", password: "glamgal123", name:'idontknow', location:'korea'});

        console.log("Finished creating users!")

    } catch (error) {
        console.error("Error creating users!");
        throw error
    }
}

async function getPostsByTagName(tagName) {
    try {
      const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
      `, [tagName]);
  
      return await Promise.all(postIds.map(
        post => getPostById(post.id)
      ));
    } catch (error) {
      throw error;
    }
  } 

async function rebuildDB(){
    try{
        client.connect();

        await dropTables();
        await createTables ();
        await createInitialUsers();
        await createInitialPosts();

    } catch (error){
        throw error
    }
}
rebuildDB().then(testDB).catch(console.error).finally(()=>{client.end()})