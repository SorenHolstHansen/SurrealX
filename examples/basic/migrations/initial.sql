-- Schemaless table
DEFINE TABLE post SCHEMALESS;

DEFINE TABLE article SCHEMAFULL;
DEFINE FIELD required ON TABLE article TYPE string ASSERT $value != NONE;
DEFINE FIELD optional ON TABLE article TYPE string;

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

CREATE user CONTENT {
    age: 10,
    name: {
        first: 'Leeroy',
        last: 'Jenkins'
    },
    comments: [{
        id: 'comment:1',
        title: 'First comment'
    }]
};

CREATE user CONTENT {
    age: 11,
    name: {
        first: 'Ben'
    }
};