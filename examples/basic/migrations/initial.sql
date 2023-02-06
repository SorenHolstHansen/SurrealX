-- Schemaless table
CREATE post SET title = "My first post";

-- Schemafull table
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD age ON TABLE user TYPE int ASSERT $value != NONE;
DEFINE FIELD name ON TABLE user TYPE object;
DEFINE FIELD name.first ON TABLE user TYPE string ASSERT $value != NONE;
DEFINE FIELD name.last ON TABLE user TYPE string;
DEFINE FIELD comments ON TABLE user TYPE array;
DEFINE FIELD comments.* ON TABLE user TYPE object ASSERT $value != NONE;
DEFINE FIELD comments.*.id ON TABLE user TYPE string ASSERT $value = /^comment:.*/;
DEFINE FIELD comments.*.title ON TABLE user TYPE string;