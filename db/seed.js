const { client, getAllUsers, createUser, updateUser, createPost } = require('./index');

async function testDB () {

    try{
        console.log("starting to test database");
        const users = await getAllUsers();
        console.log("get all users:",users);
       
        console.log("Calling updateUser on users[0]")
        const {rows:[user]} = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: "Lesterville, KY"
        });
        console.log("Result:", user);
        console.log("finish testing DB");
        return user

    }
    catch(error){
        console.error("error testing database");
        throw error
    } 
}

async function dropTables(){
    try{
        console.log("Starting to drop tables...");
        await client.query(`
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
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true);
        `);
        console.log("finish building tables");
    }catch (error){
        console.error('error building tables');
        throw error;
    }
}

async function createInitialUsers(){
    try {
        console.log("Starting to create users...")
        const albert = await createUser({username: "alejo", password: "alejo99", name:'albert', location:'mexico'});
        

        console.log("Finished creating users!")
    } catch (error) {
        console.error("Error creating users!");
        throw error
    }
}

async function rebuildDB(){
    try{
        client.connect();

        await dropTables();
        await createTables ();
        await createInitialUsers();
        await createPost({authorId: "1", title: "Title of my Post", content: "Content of my Post"})

    } catch (error){
        throw error
    }
}
rebuildDB().then(testDB).catch(console.error).finally(()=>{client.end()})