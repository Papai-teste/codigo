'use strict';

const { NatsConnection } = require('./nats-connection');

/**
 * Classe que implementa uma abstração de pool de conexões do NATS-STREAM.
 * Efetua controle de publicação de mensagens em uma conexão aleatoriamente selecionada.
 */
class StanPool {

  /**
   * @param {string} name Nome do pool ao qual a conexão pertence.
   * @param {string[]} servers URL's dos servidores a se conectar.
   * @param {string} userName Nome do usuário.
   * @param {string} password Senha do usuário.
   * @param {string} cluster Nome do cluster configurado no servidor.
   * @param {string} subject Nome do 'assunto' onde as mensagens devem ser publicadas.
   */
  constructor({ name, servers, userName, password, cluster, subject }) {

    // Bind de metodos
    // ---------------------------------------------------------------

    this.log = this.log.bind(this);
    this.publish = this.publish.bind(this);
    this.getRandomConnection = this.getRandomConnection.bind(this);

    // Definição de propriedades
    // ---------------------------------------------------------------

    this.poolname = name;
    this.connections = [];
    const errorHandler = (msg) => {
      console.error(this.log(`Reenvio de mensagem: ${msg}`));
      this.publish(msg);
    };

    // Codigo comum
    // ---------------------------------------------------------------

    console.info(this.log(`StanPool(${name}, ${servers}, ${userName}, **********, ${cluster}, ${subject})`));

    // Inicializando as conexões
    servers.forEach((server, index) => {
      this.connections.push(
        new NatsConnection({
          poolName: name,
          server,
          userName,
          password,
          subject,
          clientSeq: index,
        })
          .on('publish_error', errorHandler)
          .on('not_connected_error', errorHandler)
      );
    })


  }

  /**
   * Publica a mensagem em uma conexão aleatoriamente selecionada. Caso não existam conexões disponíveis,
   * loga a mesma no console para tratamento externo.
   * @param {string | object} msg Mensagem a ser publicada.
   */
  publish(msg) {
    if (msg) {
      const msgTxt = typeof msg === 'object' ? JSON.stringify(msg) : `${msg}`;
      try {
        this.getRandomConnection().publish(msgTxt);
      } catch (error) {
        console.error(this.log(`${error}`));
        console.error(this.log(`Mensagem nao sera enviada novamente: ${msgTxt}`));
      }
    }
  }

  /**
   * Obtém uma conexão ativa e aleatoriamente selecionada. Caso não existam conexões disponíveis,
   * dispara uma exceção 'Sem conexões disponíveis'.
   */
  getRandomConnection() {
    // melhorar esta logica
    let min = 0;
    let indexes = [];
    for (let index = min; index <= this.connections.length - 1; index++) {
      indexes.push(index);
    }

    let max = indexes.length - 1;
    while (max >= 0) {
      let rand = Math.floor(Math.random() * (max - min + 1) + min);

      let conn = this.connections[indexes[rand]];

      if (conn.connected) {
        return conn;
      }

      indexes.splice(rand, 1);

      max = indexes.length - 1;
    }

    throw new Error('Sem conexões disponíveis');
  }

  log(msg)  {
    msg = (msg) ? `: ${msg}` : '';
    return `${new Date().toISOString()} [NATSLOG-PLUGIN-POOL]${msg}`;
  }
}

module.exports = { StanPool };
