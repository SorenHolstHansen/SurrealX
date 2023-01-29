-- Add migration script here
-- SCHEMAFULL table
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD age ON TABLE user TYPE int;
DEFINE FIELD name ON TABLE user TYPE object;
DEFINE FIELD name.first ON TABLE user TYPE string ASSERT $value != NONE;
DEFINE FIELD name.last ON TABLE user TYPE string;
DEFINE FIELD comments ON TABLE user TYPE array;
DEFINE FIELD comments.* ON TABLE user TYPE object ASSERT $value != NONE;
DEFINE FIELD comments.*.id ON TABLE user TYPE string ASSERT $value = /^comment:.*/;
DEFINE FIELD comments.*.title ON TABLE user TYPE string;

CREATE user CONTENT { name: { first: "firstName" } };

SELECT * FROM user;

UPDATE user MERGE { name: {last: "lastName"} };

SELECT * FROM user;



-- SCHEMALESS TABLE
DEFINE TABLE post SCHEMALESS;

CREATE post SET title = "My first post";