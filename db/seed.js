const { client, getAllUsers } = require('./index');

async function testDB () {

    try{
        console.log("starting to test database");
        const users = await getAllUsers();
        console.log("get all users:",users);
        console.log("finish testing DB");

    }
    catch(error){
        console.error("error testing database");
        throw error
    } 
}
// testDB();

async function dropTables(){
    try{
        console.log("Starting to drop tables...");
        await client.query(`
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
            password varchar(255) NOT NULL);
        `);
        console.log("finish building tables");
    }catch (error){
        console.error('error building tables');
        throw error;
    }
}

async function rebuildDB(){
    try{
        client.connect();

        await dropTables();
        await createTables ();
    } catch (error){
        throw error
    }
}
rebuildDB().then(testDB).catch(console.error).finally(()=>{client.end()})