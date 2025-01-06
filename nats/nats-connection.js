/**
 * Module Dependencies.
 */
 const { connect, StringCodec } = require('nats');
 const EventEmitter = require('events');
 
 /**
  * Constants.
  */
 const RECONNECT_TIME_WAIT = 1 * 1000; // 1 segundo
 
 /**
  * Classe que representa uma conexão com o NATS. Extende 'EventEmitter'
  * para informar que houve erro. Caso a publicação da mensagem falhe,
  * emite um evento 'publish_error' com a mesma mensagem. Caso a conexão esteja fechada,
  * emite um evento 'not_connected_error' com a mesma mensagem.
  */
 class NatsConnection extends EventEmitter {
   /**
    * @param {string} poolName Nome do pool ao qual a conexão pertence.
    * @param {string} server URL do servidor a se conectar.
    * @param {string} userName Nome do usuário.
    * @param {string} password Senha do usuário.
    * @param {string} subject Nome do 'assunto' onde as mensagens devem ser publicadas.
    * @param {string} clientSeq Sequencial das conexões do pool que será usado para identificar o cliente.
    */
   constructor({ poolName, server, userName, password, subject, clientSeq }) {
     super();
 
     // Definição de propriedades
     // ---------------------------------------------------------------

     this.poolName = poolName;
     this.server = server;
     this.userName = userName;
     this.password = password;
     this.subject = subject;
     this.clientSeq = clientSeq;
     this.clientId = `${poolName}-client-${clientSeq}`;
     this.connected = false;
     this.options = {
       name: this.clientId,
       servers: this.server,
       user: this.userName,
       pass: this.password,
       reconnect: true,
       reconnectTimeWait: RECONNECT_TIME_WAIT,
       maxReconnectAttempts: -1,
     };
     this.codec = StringCodec();
 
     // Bind de metodos
     // ---------------------------------------------------------------
 
     this.log = this.log.bind(this);
     this.connect = this.connect.bind(this);
     this.handleStatusUpdates = this.handleStatusUpdates.bind(this);
     this.publish = this.publish.bind(this);
 
     // Codigo comum
     // ---------------------------------------------------------------
 
     this.connect();
   }
 
   /**
    * Cria a conexão de fato. Caso ocorra uma falha, tenta uma reconexão indefinidamente.
    */
   async connect() {
     // Possíveis eventos: connect, disconnect, reconnecting, reconnect, connection_lost, error, close
     this.connection = await connect(this.options);
 
     this.connected = true;
     console.info(this.log('connect', 'Conectado com sucesso'));
 
     this.handleStatusUpdates();
 
     const errClose = await this.connection.closed();
 
     if (errClose) {
       console.error(this.log('close', `Conexão fechada: ${errClose}`));
     }
 
     this.connected = false;
     // Cria uma nova conexao
     this.connect();
   }
 
   /**
    * Gerencia a conexão com o NATS de acordo com seu status
    */
   async handleStatusUpdates() {
     // eslint-disable-next-line no-restricted-syntax
     for await (const status of this.connection.status()) {
       switch (status.type) {
         case 'disconnect':
           this.connected = false;
           console.error(
             this.log('disconnect', 'Desconectado do servidor NATS')
           );
           break;
         case 'reconnecting':
           this.connected = false;
           console.error(
             this.log(
               'reconnecting',
               `Tentativa de reconexao em ${RECONNECT_TIME_WAIT}ms`
             )
           );
           break;
         case 'reconnect':
           this.connected = true;
           console.error(this.log('reconnect', 'Reconectado com sucesso'));
           break;
         case 'update':
           console.info(this.log('update', 'NATS Connection Update'));
           break;
         case 'error':
           this.connected = false;
           console.error(this.log('error', 'NATS Connection Error'));
           break;
         default:
       }
     }
   }
 
   /**
    * Publica uma mensagem através da conexão interna. Caso a publicação da mensagem falhe,
    * emite um evento 'publish_error' com a mesma mensagem. Caso a conexão esteja fechada,
    * emite um evento 'not_connected_error' com a mesma mensagem.
    * @param {string | Buffer} msg Mensagem a ser publicada.
    */
   publish(msg) {
     if (this.connected) {
       this.connection.publish(
         this.subject,
         this.codec.encode(msg),
         // eslint-disable-next-line no-unused-vars
         (err, guid) => {
           if (err) {
             console.error(
               this.log('publish', `Erro na publicacao do mensagem: ${err}`)
             );
             this.emit('publish_error', msg);
           }
         }
       );
     } else {
       console.error(
         this.log(
           'publish',
           'Mensagem nao pode ser enviada pois a conexao esta fechada.'
         )
       );
       this.emit('not_connected_error', msg);
     }
   }
 
   /**
    * Prepara o log padronizado para este objeto de conexão, informando o identificador
    * do cliente e o servidor que está conectado.
    * @param {string} event Evento ocorrido a ser logado.
    * @param {string} msg Mensagem a ser logada.
    */
   log(event, msg) {
     const msgz = msg ? `: ${msg}` : '';
     return `${new Date().toISOString()} [NATSLOG-PLUGIN-CONN] ${
       this.clientId
     }[${this.server}] (${event})${msgz}`;
   }
 }
 
 module.exports = { NatsConnection }; 