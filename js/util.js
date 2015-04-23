function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
}

function touchScroll(event) {
    event.preventDefault();
};

function salvarItens(itens, callbackSuccess, callbackError) {
    showLoading();
    $(".ui-input-search").hide();
    $.ajax({
        type: "POST",
        url: itemUrl,
        contentType: "application/json",
        data: JSON.stringify(itens),
        headers: {
            "token": sessionStorage.token
        },
        success: callbackSuccess,
        error: callbackError
    });
}

function redirecionaLista(tipoItem, descricaoItem) {
    sessionStorage.setItem('tipo', tipoItem);
    sessionStorage.setItem('descricao', descricaoItem);

    $.mobile.changePage("itensPendentes.html", {
        transition: "slide"
    });
}

function msgServicoIndisponivel(error, el) {
    limpaSession();
    bloquearScroll();
    hideLoading();
    var message = '';

    if (error.status != 403) {
        message = 'Serviço indisponível. Tente novamente mais tarde.';
    }
    else {
        message = 'Sessão expirada por inatividade. Por favor reconecte.';
    }


    $(el).simpledialog2({
        mode: 'button',
        headerText: 'Erro',
        headerClose: false,
        buttonPrompt: message,
        buttons: {
            'OK': {
                click: function () {
                    desbloquearScroll();
                    $.mobile.changePage("../index.html", {
                        transition: "slde",
                        reverse: true
                    });
                    limpaSession();
                }
            }
        }
    });
}

function bloquearScroll() {
    setTimeout(function () {
        $(window, document, 'body').bind('scrollstart', touchScroll);
        $(".background-disabled, .ui-simpledialog-screen, .ui-simpledialog-hidden, .ui-simpledialog-screen-modal").css('height', $(document).height());

    }, 100);
}

function desbloquearScroll() {
    setTimeout(function () {
        $(window, document, 'body').unbind('scrollstart', touchScroll);
    }, 100);
}

function closeModal() {
    if ($.mobile.sdCurrentDialog)
        $.mobile.sdCurrentDialog.close();
}

function showLoading() {
    var interval = setInterval(function () {
        $.mobile.loading('show');
        $(".background-disabled").fadeIn("fast");
        bloquearScroll();
        clearInterval(interval);
    }, 1);
}

function hideLoading() {
    var interval = setInterval(function () {
        $.mobile.loading('hide');
        $(".background-disabled").fadeOut("fast");
        desbloquearScroll();
        clearInterval(interval);
    }, 1);
}

function isIphone() {
    return (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i));
}


function checkthis(ele) {
    var checkbox = $(ele).parent().find('input[type=checkbox]');
    if ($(ele).parent().find('input[type=checkbox]').prop("checked")) {
        $(ele).attr("src", "../img/unchecked.png");
        checkbox.click();
    } else {
        $(ele).attr("src", "../img/checked.png");
        checkbox.click();
    }
}

function limpaSession() {
    sessionStorage.setItem('status', '');
    sessionStorage.setItem('itens', '');
    sessionStorage.setItem('descricao', '');
    sessionStorage.setItem('id', '');
    sessionStorage.setItem('tipo', '');
    sessionStorage.setItem('usuario', '');
    sessionStorage.setItem('token', '');
}