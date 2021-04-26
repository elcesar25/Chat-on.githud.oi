function validar_campos(contenedor){
    var campo=contenedor.getElementsByTagName('input');
    var vacio=0;
    var campos_vacios='';
    for(var i=0;i < campo.length; i++){
        if(campo[i].required == true && campo[i].value.trim() == '' || campo[i].value.trim() == ''){
            $(campo[i]).css('background-color','red');
            campo[i].value='';
            campos_vacios += campo[i].name.toUpperCase() + '<br>';
            $(campo[i]).mouseenter(function(){
                $(this).css('background-color','white');
            });
            $(campo[i]).change(function(){
                $(this).css('background-color','white');
            });
            $(campo[i]).focus(function(){
                $(this).css('background-color','white');
            });
            vacio++;
        }
    }
    if(vacio > 0){
        mensaje_validar(contenedor,campos_vacios);
        return false;
    }
    else{
        if(contenedor.id == 'nuevo-usuario'){
            agregarUsuario();
        }
        if(contenedor.id == 'formulario'){
            acceso(contenedor);
        }        
    }
}

var db = openDatabase('sistemaByelcesar25', '1.0', 'elcesar25 DB', 2 * 1024 * 1024);
var totalmsj=0;
function crearTabla(){
    var f=new Date();
    var dia=f.getDate();
    if(dia < 10){dia="0"+dia;}
    var mes=parseInt(f.getMonth() + 1);
    if(mes < 10){mes="0"+mes;}
    var anio=f.getFullYear();
    var FECHA=anio + "-" + mes + "-" + dia;
    db.transaction(function (SQL) {
        SQL.executeSql('CREATE TABLE IF NOT EXISTS usuarios (ID unique,NOMBRE,NICKNAME,USUARIO,NIVEL,PASSWORD,FECHA,ONLINE,BAJA)');   
        SQL.executeSql('CREATE TABLE IF NOT EXISTS chat (ID integer,MENSAJE,VISTO)');
        var NICKNAME= 'elcesar25';		
        var PASSWORD= encriptar("elcesar25",1000,anio,mes,dia); 
        var ONLINE= 'red';		
        var NIVEL=1;
        SQL.executeSql('SELECT * FROM usuarios',[], function (SQL, resultado) {
            var filas = resultado.rows.length;
            if(filas < 1){
                SQL.executeSql('INSERT INTO usuarios (ID,NICKNAME,USUARIO,NIVEL,PASSWORD,FECHA,ONLINE,BAJA) VALUES (1000, "'+ NICKNAME +'", "elcesar25@elcesar25", "'+ NIVEL +'", "'+ PASSWORD +'","'+ FECHA +'","'+ ONLINE +'","0")');  
            }
        }, null);              
    });
    if(id_usuario > 0){
        abrirChat();
    }
}

function encriptar(p,i,a,m,d){               
    var passwordEncriptado="";
    var abc="MLPOKNBJIUHVCGYTFXZDRESAWQ1029384756qazxswedcvfrtgbnhyujmkiolp56473839201";
    var i=0;
    for(var x=0; x < p.length; x ++){                     
        i+=parseInt(d);
        if( i >= abc.length ){i= -i;}
        if(i < 0){i= 0;}
        var inicio=parseInt(i);
        var fin= parseInt(inicio + parseInt(d));  
        var camuflaje=abc.substring(inicio,fin);
        if(passwordEncriptado.indexOf(camuflaje) != -1){
            inicio+= parseInt(d);
            fin = parseInt(inicio + p.length);
            camuflaje=abc.substring(inicio,fin);
        }
        passwordEncriptado +=camuflaje + p[x];
        inicio=parseInt((x / 100)*i);
        fin=parseInt(inicio + 3) ;
        camuflaje=abc.substring(inicio,fin);
        if(passwordEncriptado.indexOf(camuflaje) != -1){
            inicio+= parseInt(d);
            fin = parseInt(inicio + 3);
            camuflaje=abc.substring(inicio,fin);
        }
        passwordEncriptado +=camuflaje;
    }
    passwordEncriptado=passwordEncriptado.toUpperCase();
    return passwordEncriptado;
}

function agregarUsuario(){
    db.transaction(function (SQL) {
        var NOMBRE= document.getElementById('n-nombre').value.trim();
        var NICKNAME= document.getElementById('n-nickname').value.trim();		
        var PASSWORD= document.getElementById('n-password').value.trim();  
        var NIVEL=0;
        var ID=1000;
        var f=new Date();
        var dia=f.getDate();
        if(dia < 10){dia="0"+dia;}
        var mes=parseInt(f.getMonth() + 1);
        if(mes < 10){mes="0"+mes;}
        var anio=f.getFullYear();
        var FECHA=anio + "-" + mes + "-" + dia;
        $('#msg').fadeIn('slow');
        document.getElementById('msg').innerHTML="Espere un momento ... " + loading;
        var USUARIO= NICKNAME + "-";
        SQL.executeSql('SELECT * FROM usuarios ORDER BY ID DESC LIMIT 1',[], function (SQL, resultado) {
            ID = parseInt(resultado.rows.item(0).ID + 1);
            USUARIO += ID + "@elcesar25";             
            if(ID > 1000){
                PASSWORD=encriptar(PASSWORD,ID,anio,mes,dia);
                SQL.executeSql('INSERT INTO usuarios (ID,NOMBRE,NICKNAME,USUARIO,NIVEL,PASSWORD,FECHA,ONLINE,BAJA) VALUES ('+ ID +',"'+ NOMBRE +'","'+ NICKNAME +'", "'+ USUARIO +'", "'+ NIVEL +'", "'+ PASSWORD +'","'+ FECHA +'","red","0")');
                setTimeout(function(){
                    $('#nuevo-usuario').fadeOut('slow');
                    document.getElementById('msg').innerHTML='Usuario creado con éxito.';
                    document.getElementById('nombre-usuario').innerHTML=" Su nombre de Usuario es:<br>"+USUARIO;
                    $('#nombre-usuario').fadeIn('smooth');
                    document.getElementById('n-nombre').value='';
                    document.getElementById('n-nickname').value='';
                    document.getElementById('n-password').value=''; 
                    borrarMSG(5000);
                },2500);
            }
            else{
                setTimeout(function(){
                    document.getElementById('msg').innerHTML='¡¡ERROR!!<br>No se pudo agregar nuevo usuario.';
                    borrarMSG(5000);
                },2500);                
            }            
        }, null);
    });
}

function borrarDB(){
    db.transaction(function (SQL) {
        SQL.executeSql('DROP TABLE usuarios;'); 
        SQL.executeSql('DROP TABLE chat;');  
    });
}
var loading='<img width="20px" height="20px" src="images/loadingBar.gif">';
var id_usuario="";
var nickname="";
var nombre="";
function acceso(contenedor){
    $('#msg').fadeIn('slow');
    document.getElementById('msg').innerHTML='COMPROBANDO CREDENCIALES ... ' + loading;
    var usuario=document.getElementById('usuario').value.trim();
    var password=document.getElementById('contrasenia').value.trim();    
    db.transaction(function (SQL) { 
        SQL.executeSql('SELECT * FROM usuarios WHERE USUARIO ="'+usuario+'" LIMIT 1',[], function (SQL, resultado) {
            var filas = resultado.rows.length;           
            if(filas > 0){
                var id=resultado.rows.item(0).ID;
                var fecha=resultado.rows.item(0).FECHA;
                fecha=fecha.split('-');
                password=encriptar(password,id,fecha[0],fecha[1],fecha[2]);
                SQL.executeSql('SELECT * FROM usuarios WHERE ID='+id+' AND PASSWORD = "'+password+'"',[], function (SQL, resultado){
                    filas = resultado.rows.length;
                    if(filas > 0){
                        id_usuario=id;
                        nickname=resultado.rows.item(0).NICKNAME;
                        nombre=resultado.rows.item(0).NOMBRE;
                        if(nombre == '' || nombre == null){nombre='elcesar25';}
                        setTimeout(function(){
                            abrirChat();
                        },2000);                        
                    }
                    else{
                        borrarMSG(2000);
                        setTimeout(function(){
                            alert("¡¡ERROR!!\n\rUsuario y/o contraseña incorrectos."); 
                        },2003);                                               
                    }
                }, null);
                
            }
            else{ 
                borrarMSG(2000);
                setTimeout(function(){
                    alert("¡¡ERROR!!\n\rEL usuario no registrado.");
                },2003);                                         
            }
        }, null);              
    });    
    
}
var usuarios=Array();
var to=0;
function abrirChat(){    
    $('#iniciar-sesion').fadeOut('smooth',function(){
        $('#sala-chat').fadeIn('smooth',function(){
             db.transaction(function (SQL) {
                 SQL.executeSql('UPDATE usuarios SET ONLINE="lime" WHERE ID='+id_usuario);
                 document.getElementById('nombre-usuario1').innerHTML=nombre;
                 //ventana=window.open("index.html","_self");
                 document.getElementById('iniciar-sesion').parentNode.removeChild(document.getElementById('iniciar-sesion'));
                 cargarMensajes();
             });            
        });        
    });    
}
function adios(){
    db.transaction(function (SQL) {
        document.getElementById('nombre-usuario1').innerHTML="Cerrando Sesión ... " + loading;
        SQL.executeSql('UPDATE usuarios SET ONLINE="red" WHERE ID='+id_usuario,[], function (SQL, resultado) {
            setTimeout(function(){
                window.open("index.html","_self");
            },1500);             
        });       
    });
}
var ventana='';
function cargarMensajes(){    
    db.transaction(function (SQL) {  
        SQL.executeSql('SELECT * FROM usuarios WHERE BAJA="0" ORDER BY ID ASC',[], function (SQL, resultado) {
            var online='';
            var cto=0;
            for(var x=0; x < resultado.rows.length; x++){
                var ID=resultado.rows.item(x).ID;  
                usuarios[ID]=new Array();
                usuarios[ID]["nombre"]=resultado.rows.item(x).NOMBRE;
                usuarios[ID]["nickname"]=resultado.rows.item(x).NICKNAME;
                usuarios[ID]["online"]=resultado.rows.item(x).ONLINE;
                var status=usuarios[ID]["online"];
                if(status == 'lime'){cto++;}
                if(ID == id_usuario){status = 'lime';}
                if(ID != id_usuario){
                    online += ' <div style="display:inline-block;font-size:11px;">'+usuarios[ID]["nickname"]+'<span style="display:inline-block; min-width:10px; min-height:10px;background-color:'+status+'; border-radius:5px; margin-left:2px;;"></span></div> | ';
                }                
            }
            if(to != cto){
                to=resultado.rows.length;
                document.getElementById('usuarios-online').innerHTML=online;
            }             
        });
        SQL.executeSql('SELECT * FROM chat',[], function (SQL, resultado) {
            var filas = resultado.rows.length;
            if(filas > 0){                
                var x=0;
                var mensajes='<br>';               
                while(x < filas){ 
                    var vistoPor='';
                    var vp=resultado.rows.item(x).VISTO;                                        
                    var id=resultado.rows.item(x).ID;
                    var usuario= usuarios[id]["nickname"];
                    var msj=resultado.rows.item(x).MENSAJE;
                    if(id == id_usuario){
                        usuario="YO";
                    }
                    //if(id != id_usuario){
                        if(vp != null){
                            vp=vp.split(',');
                            for(var v=0; v < vp.length; v++){
                                if(vp[v] != id_usuario && vp[v] != id){
                                    vistoPor += usuarios[vp[v]]["nickname"]+", ";
                                }
                            }
                        }                        
                    //}
                    if(vistoPor == ''){vistoPor="Nadie :´(";}
                    mensajes += '<div class="mensaje" title="Visto por: '+vistoPor+'"><span>'+usuario+':</span>'+msj+'</div><br>';
                    x++;
                }
                if(visto != sinver){sinver=visto;}
                document.getElementById('contenedor-mensajes').innerHTML=mensajes; 
                if(totalmsj != filas){
                    totalmsj=filas;
                    $('#contenedor-mensajes').scrollTop(1000000);
                }                
            }
        }, null);              
    });
}
var visto=0;
var sinver=0;
function mensajeVisto(){
     //var sql="UPDATE chat SET VISTO=CONCAT(VISTO, '"+id_usuario+",') WHERE ID NOT IN("+id_usuario+") AND VISTO NOT LIKE '%" + id_usuario + "%'";
    var sql='UPDATE chat SET VISTO=VISTO||",'+id_usuario+'" WHERE ID <> '+id_usuario+' AND VISTO NOT LIKE "%'+id_usuario+'%" OR ID <> '+id_usuario+' AND VISTO=""';
    db.transaction(function (SQL) {
        SQL.executeSql(sql,[],function (SQL, resultado) {
             visto++;     
        });       
    });
}
function enviarMensaje(txt){
    if(txt.value.trim() == ''){
        txt.value='';
        $(txt).css('box-shadow','0px 0px 3px 3px red');
        txt.focus();
        setTimeout(function(){
            $(txt).css('box-shadow','0px 0px 0px 0px transparent');
        },3000);
    }
    else{
        var mensaje=txt.value.trim().replace(/"/g,"&quot;");
        db.transaction(function (SQL) {
            SQL.executeSql('INSERT INTO chat (ID,MENSAJE,VISTO) VALUES ('+id_usuario+',"'+mensaje+'","'+id_usuario+'")');
            SQL.executeSql('SELECT * FROM chat',[], function (SQL, resultado) {
                var filas = resultado.rows.length;
                if(totalmsj < filas){                    
                    txt.value='';
                    cargarMensajes();
                }
                else{
                    alert("¡¡ERROR!\n\rMENSAJE NO ENVIADO");
                }
            }, null);
        });
    }
}
function borrarMSG(s){    
    setTimeout(function(){
        if(document.getElementById('msg') != null){
            $('#msg').fadeOut('slow');
            document.getElementById('msg').innerHTML='';
        }
    },s);
}
function mensaje_validar(contenedor,campos){
    var msg='¡¡ATENCIÓN!!<br>Los siguientes campos son requeridos:<br>' + campos;
    document.getElementById('msg').innerHTML = msg;
    $('#msg').fadeIn('slow');
    //return false;
    setTimeout(function(){
        if(document.getElementById('msg') != null){
            $('#msg').fadeOut('slow');
            document.getElementById('msg').innerHTML='';
        }
    },5000);
}
function cargarStatus(){
    db.transaction(function (SQL) {
    SQL.executeSql('SELECT * FROM usuarios WHERE ID NOT IN('+id_usuario+') AND BAJA="0" ORDER BY ID ASC',[], function (SQL, resultado) {
            var online='';
            var cto=0;
            for(var x=0; x < resultado.rows.length; x++){
                var ID=resultado.rows.item(x).ID;
                usuarios[ID]=new Array();
                usuarios[ID]["nombre"]=resultado.rows.item(x).NOMBRE;
                usuarios[ID]["nickname"]=resultado.rows.item(x).NICKNAME;
                usuarios[ID]["online"]=resultado.rows.item(x).ONLINE;
                var status=usuarios[ID]["online"];                
                if(ID == id_usuario){status = 'lime';}
                if(status == 'lime'){cto++;}
                if(ID != id_usuario){
                    online += ' <div style="display:inline-block;font-size:11px;">'+usuarios[ID]["nickname"]+'<span style="display:inline-block; min-width:10px; min-height:10px;background-color:'+status+'; border-radius:5px; margin-left:2px;;"></span></div> | ';
                }                
            }
            if(to != cto){
                to=cto;
                document.getElementById('usuarios-online').innerHTML=online;
            }            
        });
    });
}
setInterval(function(){
    db.transaction(function (SQL) {
        SQL.executeSql('SELECT * FROM chat',[], function (SQL, resultado) {
            var filas = resultado.rows.length;
            if(totalmsj != filas || visto != sinver){                
                cargarMensajes();
            }
        });
        if(id_usuario != ''){
            cargarStatus();
        }        
    });
},2000);
function fondo_blanco(objeto){
    $(objeto).css('background-color','white');
}