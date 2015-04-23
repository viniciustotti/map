$(document).on("pageinit", "#pagDetalhamento", function () {
    showLoading();

    if (sessionStorage.getItem('status') == 'E') {
        $(".list-buttons").hide();
        $('#observacao').attr('disabled', 'disabled');
        if (!isIphone()) {
            $('#observacao').css('background', '#E2E2E2');
        }

    }

    sessionStorage.getItem('itens');

    if (isIphone()) {
        $(".ui-state-disabled").css("opacity", "1");
        $("#observacao").css("opacity", "1");
        $(".iphone-tollbar").show();
    }
    var $body = jQuery('body');
    $(document)
    .on('focus', 'textarea', function (e) {
        $body.addClass('fixfixed');

    })
    .on('blur', 'textarea', function (e) {
        $body.removeClass('fixfixed');
    });

    document.getElementById('tipoItemDetalhamento').innerHTML = sessionStorage.getItem('descricao');

    detalharItem();
});

function detalharItem() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: itemUrl + sessionStorage.getItem('id'),
        headers: {
            "token": sessionStorage.token
        },
        success: onSuccessDetalharItem,
        error: onErrorDetalharItem
    })
    .done(function () {
        hideLoading();
    });
}

function onErrorDetalharItem(jqXHR, textStatus, errorThrown) {
    hideLoading();
    msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
}

function onSuccessDetalharItem(data) {
    $("#filial").val(data.filial);
    $("#numeroDocumento").val(data.numeroDocumento);

    var dataString = data.emissao.split(' ')[0];
    $("#emissao").val(dataString);

    $("#usuarioSolicitante").val(data.usuarioSolicitante);
    $("#centroCusto").val(data.centroCusto);
    $("#descricaoCentroCusto").val(data.descricaoCentroCusto);
    $("#itemContabil").val(data.itemContabil);
    $("#descricaoItemContabil").val(data.descricaoItemContabil);
    $("#valorTotal").val(data.valorTotal);
    $("#detalhe").val(data.detalhe);
    $("#observacao").val(data.observacao);
    hideLoading();
}

function AprovarReprovarItem(codTipo, el) {

    var item = [];
    var observacao = $("#observacao").val();

    var msg = codTipo == '03' ? 'aprovação?' : 'reprovação?'

    bloquearScroll();

    $(el).simpledialog2({
        mode: 'button',
        headerText: 'Confirmação',
        headerClose: false,
        buttonPrompt: 'Confirma a ' + msg,
        buttons: {
            'OK': {
                click: function () {
                    item.push({
                        "id": sessionStorage.getItem('id'),
                        "statusAprovacao": codTipo,
                        "observacao": observacao
                    });
                    salvarItens(item, onSuccessSalvarItem, onErrorSalvarItem)
                }
            },
            'Cancel': {
                click: function () {
                    desbloquearScroll();
                },
                icon: "delete",
                theme: "b"
            }
        }
    });

}

function onSuccessSalvarItem() {
    desbloquearScroll();
    $.mobile.back();
}

function onErrorSalvarItem(jqXHR, textStatus, errorThrown) {
    desbloquearScroll();
    msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
}

function limitTextarea(elem) {
    var limit = parseInt($(elem).attr('maxlength'));
    var text = $(elem).val();
    var chars = text.length;

    if (chars > limit) {
        var new_text = text.substr(0, limit);
        $(elem).val(new_text);
    }
}