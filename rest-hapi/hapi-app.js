/**
 * Created by hamada on 11/23/15.
 */

var hapi = require('hapi'),
    mongoskin = require('mongoskin'),
    server = hapi.createServer('localhost', 3000),
    db = mongoskin.db('mongodb://@localhost:27017/test', {safe: true}),
    id = mongoskin.helper.toObjectID

var loadCollection = function(name, callback){
    callback(db.collection(name))
}

server.route([
    {
        method: 'GET',
        path: '/',
        handler: function(req, reply){
            reply('Select a collection, e.g., /collections/messages')
        }
    },
    {
        method: 'GET',
        path: '/collections/{collectionName}',
        handler: function(req, reply){
            loadCollection(req.params.collectionName, function(collection){
                collection.find({}, {
                    limit:10,
                    sort:[['_id', -1]]}).toArray(function(error, results){
                    if(error) return reply(error)
                    reply(results)
                })
            })
        }
    },
    {
        method: 'POST',
        path: '/collections/{collectionName}',
        handler: function(req, reply){
            loadCollection(req.params.collectionName, function(collection){
                collection.insert(req.payload, {}, function(error, results){
                    if(error) reply(error)
                    reply(results)
                })
            })
        }
    },
    {
        method: 'GET',
        path: '/collections/{collectionName}/{id}',
        handler: function(req, reply){
            loadCollection(req.params.collectionName, function(collection){
                collection.findOne({_id: id(req.params.id)}, function(error, result){
                    if(error) reply(error)
                    reply(result)
                })
            })
        }
    },
    {
        method: 'PUT',
        path: '/collections/{collectionName}/{id}',
        handler: function(req, reply){
            loadCollection(req.params.collectionName, function(collection){
                collection.update({_id: id(req.params.id)}, {$set:req.payload},
                    {safe: true, multi: false}, function(error, result){
                        if(error) reply(error)
                        reply((result === 1) ? {msg: 'success'}: {msg: 'error'})
                    })
            })
        }
    },
    {
        method: 'DELETE',
        path: '/collections/{collectionName}/{id}',
        handler: function(req, reply){
            loadCollection(req.params.collectionName, function(collection){
                collection.remove({_id: id(req.params.id)}, function(error, result){
                    if(error) reply(error)
                    reply((result === 1) ?  {msg: 'success'}: {msg: 'error'})
                })
            })
        }
    }
])

var options = {
    subscribers:{
        'console':['ops','request','log','error']
    }
};

server.pack.require('good', options, function(error){
    if(!error){
        //plugin loaded successfuly
        console.error(error)
    }
});

server.start()