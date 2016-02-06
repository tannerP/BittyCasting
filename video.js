/** 	Features
- Listing of avaialble videos
- Requesting of a video for playback
- Uploading of a video to the server
**/

var fs, uploadPath, supportedTypes;
fs = require('fs');
uploadPath = __dirname + '/../videos';
suportedTypes  = [ 'video/mp4', 'video/webm', 'video/ogg'];

module.exports = {
	list : list, 
	request : request, 
	upload : upload
};

function list (stream, meta) {
	fs.readdir(uploadPath, function(err, files) {
		stream.write({files: files});
	});
}

function request(client, meta) {
	var file = fs.createReadStream(uploadPath + '/' meta.name);

	client.send(file);
}

function upload(stream, meta) {
	if (!~supportedTypes.indexOf(meta.type)) {
		stream.write({err:'Unsupported type: ' meta.type});
		stream.end();
		return;
	}

	var file = fs.createWriteStream(uploadPath + '/' + meta.name);
	stream.pipe(file);

	stream.on('data', function(data){
		stream.write({rx:data.length/meta.size});
	});

	stream.on('end', function(){
		stream.write({ end:true });
	})
}


