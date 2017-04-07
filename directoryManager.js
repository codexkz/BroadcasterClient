
/*
*  rootDirectoryEntry(Directory)
*       |
*       └───── Directory-LinkList 
*                  |
*                  ├───── DirectoryEntry(File)
*                  |             |
*                  |             └───── File-FilePath
*                  |
*                  └───── DirectoryEntry(Directory)
*                                |
*                                └───── Directory-LinkList 
*                                              |
*                                              ├───── DirectoryEntry 
*                                              |
*                                              ├───── DirectoryEntry 
*                                              |
*                                              ├───── DirectoryEntry 
*                                              |          .
*                                                         .
*                                                         .
*/

(function(){

directoryManager = new DirectoryManager() ;

function DirectoryEntry( currentDirectory , entity , isDirectory , degree , uuid){
    this.currentDirectory = currentDirectory ? currentDirectory : null ;
    this.isDirectory = isDirectory ;
    this.isFile = !isDirectory ;
    this.degree = degree ;
    this.entity = entity ;
    this.uuid   = uuid;
};

function Directory( name , parentDirectory ){
    this.name = name ? name : null;
    this.entry = null ;
    this.directoryEntryList = new LinkList();
    this.parentDirectory = parentDirectory ? parentDirectory : '' ;

    this.setEntry =function (entry){
        this.entry = entry ;
    };

    this.find = function(entityName){
        let ans = null ;
        this.directoryEntryList.each(function(node){
             if(entityName === node.data.entity.name) ans = node.data.entity ;
        });
        return ans ;
    };
    this.list = function(){
        this.directoryEntryList.each(function(node){
             console.log(node.data.entity.name);
        });
    };
};

function DirectorySystem( musicFileList ){
    let rootDirectoryEntry = null ;
    let rootDirectory = null ;
    let currentDirectory = rootDirectory ;
    let uuid = 0 ;

    (function initDirectoryManager(fileList){
        rootDirectory = new Directory(fileList.start.data.path[0] , null );
        rootDirectoryEntry = new DirectoryEntry(null,rootDirectory,true,0);
        fileList.each(function(node){
           let current = rootDirectory;
           let degree = 0 ;
           for(let i = 0 ; i < node.data.path.length ; i++ ){
                let targetDirectoryEntry = null ;
                //if this node is file , create DirectoryEntry point to file
                if( i === node.data.path.length-1  ){
                    targetDirectoryEntry = new DirectoryEntry( current,node.data.file  , false , degree , getUUID());
                    current.directoryEntryList.add(targetDirectoryEntry);
                    degree = 0;
                    return;
                }
                //if this node is directory and is not exsit , create DirectoryEntry point to directory
                let targetDirectory = current.find(node.data.path[i]) ;
                if( !targetDirectory ){
                   targetDirectory = new Directory(node.data.path[i] , current ) ;
                   targetDirectoryEntry = new DirectoryEntry(  current,targetDirectory , true  , degree , getUUID());
                   current.directoryEntryList.add(targetDirectoryEntry);
                   targetDirectory.setEntry(targetDirectoryEntry);
                }
                degree++;
                current = targetDirectory ;
           }
        });
    })(musicFileList);

    this.setCurrentDirectory =function (directory){
          currentDirectory = directory ;
    };

    this.getCurrentDirectory =function (){
          return currentDirectory ;
    };

    this.getRootDirectoryEntry =function (){
          return rootDirectoryEntry ;
    };


    this.draw = function(){
        rootDirectory.directoryEntryList.each(function repeat(node){
                let space = '';
                for(let i=0 ; i<node.data.degree ; i++)
                     space += '     ' ;
                if(node.data.isDirectory){
                    console.log(space + node.data.degree +'/' + node.data.isFile + '/' + node.data.entity.name ) ;
                    node.data.entity.directoryEntryList.each(repeat);
                }else{
                    console.log(space + node.data.degree +'/' + node.data.isFile + '/' + node.data.entity.name ) ;
                }
        });
    };

    function getUUID(){
        return uuid ++ ;
    }
};

  function FilePicker ( files ) {
    let acceptFilePattern = /\.((3gp)|(avi)|(mov)|(mp4)|(m4v)|(m4a)|(mp3)|(mkv)|(ogv)|(ogm)|(ogg)|(oga)|(webm)|(wav))$/
    let musicFileList = null;

    (function createMusicFileList (fs) {
            let list = new LinkList() ;
            let pattern = acceptFilePattern ? acceptFilePattern : /$./;
            for (let i=0; i<fs.length; i++) {
                  if((pattern).test(fs[i].name)) {
                       let fpath = fs[i].relativePath || fs[i].webkitRelativePath ;
                       list.add( { file:fs[i] , path : fpath.split(/\//)  } );
                  }   
            };
            musicFileList = list ;
      })(files);

      //this.setMusicFileList = function(v) {musicFileList = v ;};
      this.getMusicFileList = function() {return musicFileList ;};



      
      /*
      
      var filelist = f ;
      var acceptFileTypelist = ["mp3","ogg","wav"] ;

      this.setFilelist = function(v) {filelist = v ;};
      this.getFilelist = function() {return filelist ;};
      this.setAcceptFileTypelist = function(v) {acceptFileTypelist = v ;};
      this.getAcceptFileTypelist = function() {return acceptFileTypelist ;};
      this.setAcceptFilePattern = function(v) {acceptFilePattern = v ;};
      this.getAcceptFilePattern = function() {return acceptFilePattern ;};




      this.createAcceptFileTypelist = function(){
            let array = new Array();
            for(let i in arguments ) 
                array.push(arguments[i]);
            acceptFileTypelist = array ;
            this.setAcceptFilePattern();
      };

      this.createAcceptFilePattern = function(){
            let str = "\.(" , i = 0 ;
            while (i < acceptFileTypelist.length-1){
                    str += "("+this.acceptFileTypelist[i]+")|"
                    i++;
            };
            str += "("+this.acceptFileTypelist[i]+")";
            str += ")$";
            acceptFilePattern = new RegExp(str);
      };
      */
};

function LinkList(){
    this.start = null ;
    this.end = null ;
    this.size = 0;

    this.makeNode = function(){
      return {data:null,next:null};
    };

    this.add=function (data){
        if(this.start===null){ 
            this.start = this.makeNode(); 
            this.end = this.start;
        }else{ 
            this.end.next = this.makeNode(); 
            this.end = this.end.next; 
        };
        this.end.data = data;
        this.size ++;
    };

    this.insertAsFirst = function(data) {
          var temp = this.makeNode();
          temp.next = this.start; 
          this.start = temp; 
          temp.data = data; 
          this.size ++;
    };


    this.insertAfter = function(t, data) { 
          var current = this.start; 
          while (current !== null) { 
              if (current.data === t) { 
                  var temp = this.makeNode();
                  temp.data = data; 
                  temp.next = current.next; 
                  if (current === this.end) this.end = temp;
                      current.next = temp; 
                      this.size ++;
                      return; 
              } 
              current = current.next; 
          }
    };


    this.delete = function(data) { 
          var current = this.start; 
          var previous = this.start; 
          while (current !== null) { 
              if (data === current.data) { 
                    if (current === this.start) { 
                          this.start = current.next; 
                          this.size --;
                          return; 
                    } 
                    if (current === this.end) this.end = previous;
                    previous.next = current.next; 
                    this.size --;
                    return; 
              }
              previous = current; 
              current = current.next; 
          }
    }; 

    this.item = function(i) { 
          var current = this.start; 
          while (current !== null) { 
              i--; 
              if (i === 0) return current; 
              current = current.next; 
          } 
          return null; 
    }; 

    this.each = function(fn) {
          var current = this.start;
          while (current !== null) { 
              fn(current); 
              current = current.next; 
          } 
    };
};


function DirectoryManager(){
      var directorySystem = null ;
      this.createDirectorySystem =  function ( files ){
          return directorySystem = new DirectorySystem(new FilePicker(files).getMusicFileList());
      };
      this.getDirectorySystem =function (){
          return directorySystem ;
      };
};

})();
