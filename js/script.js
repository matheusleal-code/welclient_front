const apiUrl = "http://localhost:4444/api/v1/clients";

const Modal = {
  open() {
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
  },

  close() {
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  },
}

const showAllDataClient = {
  open() {
    document
      .querySelector('.modal-overlay-client')
      .classList
      .add('active')
  },

  close() {
    document
      .querySelector('.modal-overlay-client')
      .classList
      .remove('active')
  },
}

const List = {
  isShow: false,

  show() {
    List.isShow = !List.isShow;
    dom.clearNotification();
    
    if (List.isShow) {
      if (Client.all.length === 0) {
        dom.addStyleBtn(true);
        dom.addNewNotification("Nenhum cliente cadastrado", "red");
        setTimeout(function () { dom.clearNotification() }, 3000);
      } else {
        dom.addStyleBtn(true);
        Client.all.forEach((client, index) => dom.addNewClient(client, index));
      }
    } else {
      dom.addStyleBtn(false);
      dom.clearClients();
    }
  }
}


const Client = {
  all: [],

  async fetchAll() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('data ', data);
      Client.all = data;
      console.log('Client.ALL ', Client.all)
      List.show();
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
      dom.addNewNotification("Erro ao carregar clientes", "red");
      setTimeout(() => dom.clearNotification(), 3000);
    }
  },

  async add(client) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(client),
      });
      const newClient = await response.json();
      Client.all.push(newClient.client);
      dom.addNewNotification("Cliente adicionado com sucesso!", "blue");
      setTimeout(() => dom.clearNotification(), 3000);
      List.show();
    } catch (error) {
      console.error("Erro ao adicionar cliente: ", error);
      dom.addNewNotification("Erro ao adicionar cliente", "red");
      setTimeout(() => dom.clearNotification(), 3000);
    }
  },

  async remove(index) {
    const client = Client.all[index];
    try {
      const response = await fetch(`${apiUrl}/${client.cpforcnpj}`, {
        method: "DELETE",
      });
      if (response.ok) {
        Client.all.splice(index, 1);
        dom.addStyleBtn(false);
        App.reload();
        List.isShow = false;
        dom.addNewNotification("Cliente excluído com sucesso!", "blue");
        setTimeout(() => dom.clearNotification(), 3000);
        List.show();
      }
    } catch (error) {
      console.error("Erro ao excluir cliente: ", error);
      dom.addNewNotification("Erro ao excluir cliente", "red");
      setTimeout(() => dom.clearNotification(), 3000);
    }
  },

  async search(cpforcnpj) {
    let isSuccess = false;
    dom.clearNotification();
    try {
      const response = await fetch(`${apiUrl}?cpforcnpj=${cpforcnpj}`);
      const client = await response.json();
      if (client) {
        isSuccess = true;
        dom.addNewClient(client[0]);
      } else {
        dom.addNewNotification("Cliente não encontrado", "red");
        setTimeout(() => dom.clearNotification(), 3000);
      }
    } catch (error) {
      console.error("Erro ao buscar cliente: ", error);
      dom.addNewNotification("Erro ao buscar cliente", "red");
      setTimeout(() => dom.clearNotification(), 3000);
    }
  }
};

const Search = {
  search: document.querySelector("input#search"),

  getValue() {
    return Search.search.value;
  },

  formatValue() {
    return Search.getValue();
  },

  submit(event) {
    event.preventDefault();
    App.reload();
    List.isShow = false;
    try {
      const cpforcnpj = Search.formatValue();
      dom.addStyleBtn(false);
      
      Client.search(cpforcnpj);
    } catch (err) {
      alert(err.message);
    }
  }
};

const dom = {
  clientNewContainer: document.querySelector('.box'),
  notificationContainer: document.querySelector('.notification-container'),
  btnList: document.querySelector('#btn-list'),

  addStyleBtn(isOpen) {
    if (isOpen) {
      dom.btnList.classList.add('open');
    } else {
      dom.btnList.classList.remove('open');
    }
  },

  addNewNotification(text, color) {
    const div = document.createElement('div');
    div.innerHTML = dom.innerHTMLNotification(text);
    div.id = "notification";
    div.style.color = color;
    dom.notificationContainer.appendChild(div);
  },

  addNewClient(client, index) {
    const div = document.createElement('div');
    div.innerHTML = dom.innerHTMLNewClient(client, index);
    dom.clientNewContainer.appendChild(div);
  },

  innerHTMLNotification(text) {
    const html = `
      <span>${text}</span>
    `;
    return html;
  },

  innerHTMLNewClient(client, index) {
    const html = `
      <div class="row">
        <div class="row-main">
          <p>Nome: ${client.name}</p>
          <p>Telefone: ${client.tel}</p>
          <p>CPF/CNPJ: ${client.cpforcnpj}</p>
          <button id="trash"  data-tooltip="Excluir" onClick="Client.remove(${index})"><i class="fa fa-trash"></i></button>
          <label class="item" id="eye" for=${client.cpforcnpj}><i  data-tooltip="Mostrar Mais" class="fa fa-eye"></i></label>
        </div>
      </div>
      <input type="checkbox" id=${client.cpforcnpj}>
      <div id="row-second">
        <div class="row">
          <p>Endereço: ${client.address}</p>
          <p>Número: ${client.number}</p>
        </div>
        <div class="row">
          <p>CEP: ${client.cep}</p>
          <p>Bairro: ${client.district}</p>
          <p>Cidade: ${client.city}</p>
        </div>
        <div class="row">
          <p>Email: ${client.email}</p>
        </div>
      </div>
    `;
    return html;
  },

  clearClients() {
    dom.clientNewContainer.innerHTML = "";
  },

  clearNotification() {
    dom.notificationContainer.innerHTML = "";
  }
};

const Form = {
  name: document.querySelector("input#name"),
  email: document.querySelector("input#email"),
  cpforcnpj: document.querySelector("input#cpforcnpj"),
  tel: document.querySelector("input#tel"),
  address: document.querySelector("input#address"),
  number: document.querySelector("input#number"),
  cep: document.querySelector("input#cep"),
  district: document.querySelector("input#district"),
  city: document.querySelector("input#city"),
  uf: document.querySelector("input#uf"),

  getValues() {
    return {
      name: Form.name.value,
      email: Form.email.value,
      cpforcnpj: Form.cpforcnpj.value,
      tel: Form.tel.value,
      address: Form.address.value,
      number: Form.number.value,
      cep: Form.cep.value,
      district: Form.district.value,
      city: Form.city.value,
      uf: Form.uf.value,
    };
  },

  validateFields() {
    const { name, email, cpforcnpj, tel, address, number, cep, district, city, uf } = Form.getValues();
    if (
      name.trim() === "" || email.trim() === "" ||
      tel.trim() === "" || cpforcnpj.trim() === "" ||
      address.trim() === "" || number.trim() === "" ||
      cep.trim() === "" || district.trim() === "" ||
      city.trim() === "" || uf.trim() === "") {
      throw new Error("Preencha todos os campos!");
    }
  },

  formatValues() {
    let { name, email, tel, cpforcnpj, address, number, cep, district, city, uf } = Form.getValues();
    return {
      name,
      email,
      tel,
      cpforcnpj,
      address,
      number,
      cep,
      district,
      city,
      uf
    };
  },

  clearFields() {
    Form.name.value = "";
    Form.email.value = "";
    Form.tel.value = "";
    Form.cpforcnpj.value = "";
    Form.address.value = "";
    Form.number.value = "";
    Form.cep.value = "";
    Form.district.value = "";
    Form.city.value = "";
    Form.uf.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      Form.validateFields();
      const newClient = Form.formatValues();
      Client.add(newClient);
      Form.clearFields();
      Modal.close();
      dom.addNewNotification("Cliente cadastrado com sucesso!", "blue");
      setTimeout(() => dom.clearNotification(), 3000);
    } catch (err) {
      alert(err.message);
    }
  }
};

const App = {
  init() {
    Client.fetchAll();
    dom.addStyleBtn(false);
    List.show();
  },

  reload() {
    dom.clearClients();
    List.show();
  }
};

App.init();
