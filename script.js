let currentCalculator = 'compound';
let fullTable = false;

function selectCalculator(type) {
    currentCalculator = type;
    document.querySelectorAll('.calc-type').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.calculator-type').forEach(el => el.classList.remove('active'));
    document.querySelector(`.calc-type[onclick="selectCalculator('${type}')"]`).classList.add('active');
    document.getElementById(type).classList.add('active');
}

function formatCurrency(input) {
    let value = input.value.replace(/[^\d,]/g, '');
    const commaCount = value.split(',').length - 1;
    if (commaCount > 1) value = value.replace(/,+$/, '');
    let parts = value.split(',');
    let integerPart = parts[0].replace(/\D/g, '');
    let decimalPart = parts.length > 1 ? parts[1].replace(/\D/g, '').substring(0, 2) : '00';
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (!integerPart) integerPart = '0';
    input.value = integerPart + ',' + decimalPart;
}

function parseCurrency(value) {
    return value ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : 0;
}

function generateTable(data, columns) {
    let tableHTML = `<div class="table-container"><table class="result-table"><thead><tr>`;
    columns.forEach(col => tableHTML += `<th>${col}</th>`);
    tableHTML += `</tr></thead><tbody>`;
    data.forEach(row => {
        tableHTML += `<tr>`;
        row.forEach(cell => tableHTML += `<td>${cell}</td>`);
        tableHTML += `</tr>`;
    });
    tableHTML += `</tbody></table></div>`;
    return tableHTML;
}

function calculateCompound() {
    try {
        const initialValue = parseCurrency(document.getElementById('jc-initialValue').value) || 1000;
        const interestRate = (parseFloat(document.getElementById('jc-interestRate').value) || 11) / 100;
        const interestPeriod = document.getElementById('jc-interestPeriod').value;
        const period = parseInt(document.getElementById('jc-period').value) || 2;
        const periodType = document.getElementById('jc-periodType').value;
        
        const monthlyInterestRate = interestPeriod === 'annual' ? Math.pow(1 + interestRate, 1/12) - 1 : interestRate;
        const totalMonths = periodType === 'years' ? period * 12 : period;
        const finalValue = initialValue * Math.pow(1 + monthlyInterestRate, totalMonths);
        
        let tableData = [];
        let currentValue = initialValue;
        
        for (let month = 1; month <= (fullTable ? totalMonths : Math.min(12, totalMonths)); month++) {
            const interest = currentValue * monthlyInterestRate;
            const endValue = currentValue + interest;
            tableData.push([month, 
                `R$ ${currentValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${interest.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${endValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}`]);
            currentValue = endValue;
        }
        
        document.getElementById('resultTitle').textContent = 'Resultado - Juros Compostos';
        document.getElementById('resultContent').innerHTML = `
            <div class="result-item"><span class="result-label">Valor Final:</span><span class="result-value">R$ ${finalValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
            <div class="result-item"><span class="result-label">Valor Inicial:</span><span class="result-value">R$ ${initialValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
            <div class="result-item"><span class="result-label">Juros Acumulados:</span><span class="result-value">R$ ${(finalValue-initialValue).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>`;
        
        document.getElementById('resultTable').innerHTML = `
            <div class="table-title">Evolução do Investimento</div>
            ${generateTable(tableData, ['Mês', 'Valor Inicial', 'Juros do Mês', 'Valor Final'])}
            ${totalMonths > 12 && !fullTable ? `<button class="show-more-btn" onclick="fullTable=true;calculateCompound()">Ver Mais</button>` : ''}`;
        
        document.getElementById('formulaInfo').textContent = `Fórmula: VF = VP × (1 + i)ⁿ | Taxa mensal: ${(monthlyInterestRate*100).toFixed(4)}% | Período: ${totalMonths} meses`;
        document.getElementById('resultSection').style.display = 'block';
    } catch(e) { alert("Erro no cálculo: "+e.message); console.error(e); }
}

function calculateSAC() {
    try {
        const value = parseCurrency(document.getElementById('sac-value').value) || 100000;
        const annualInterest = (parseFloat(document.getElementById('sac-interest').value) || 8) / 100;
        const periodYears = parseInt(document.getElementById('sac-period').value) || 20;
        const month = parseInt(document.getElementById('sac-month').value) || 1;
        const totalMonths = periodYears * 12;
        
        if (month < 1 || month > totalMonths) return alert(`Mês deve ser entre 1 e ${totalMonths}`);
        
        const monthlyInterest = annualInterest / 12;
        const amortization = value / totalMonths;
        const balance = value - (amortization * (month - 1));
        
        let tableData = [];
        let currentBalance = value;
        
        for (let m = 1; m <= (fullTable ? totalMonths : Math.min(12, totalMonths)); m++) {
            const monthInterest = currentBalance * monthlyInterest;
            tableData.push([m, 
                `R$ ${(amortization + monthInterest).toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${amortization.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${monthInterest.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${(currentBalance - amortization).toLocaleString('pt-BR',{minimumFractionDigits:2})}`]);
            currentBalance -= amortization;
        }
        
        document.getElementById('resultTitle').textContent = `Resultado SAC - Mês ${month}`;
        document.getElementById('resultContent').innerHTML = `
            <div class="result-item"><span class="result-label">Amortização:</span><span class="result-value">R$ ${amortization.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
            <div class="result-item"><span class="result-label">Juros do Mês:</span><span class="result-value">R$ ${(balance*monthlyInterest).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
            <div class="result-item"><span class="result-label">Parcela do Mês:</span><span class="result-value">R$ ${(amortization+(balance*monthlyInterest)).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>`;
        
        document.getElementById('resultTable').innerHTML = `
            <div class="table-title">Tabela SAC</div>
            ${generateTable(tableData, ['Mês', 'Parcela', 'Amortização', 'Juros', 'Saldo'])}
            ${totalMonths > 12 && !fullTable ? `<button class="show-more-btn" onclick="fullTable=true;calculateSAC()">Ver Mais</button>` : ''}`;
        
        document.getElementById('formulaInfo').textContent = `Fórmula: Amortização = PV/n | Juros = Saldo × i | Total meses: ${totalMonths}`;
        document.getElementById('resultSection').style.display = 'block';
    } catch(e) { alert("Erro no cálculo SAC: "+e.message); console.error(e); }
}

function calculatePrice() {
    try {
        const installment = parseCurrency(document.getElementById('price-installment').value) || 1200;
        const value = parseCurrency(document.getElementById('price-value').value) || 100000;
        const monthlyInterest = parseFloat(document.getElementById('price-interest').value) || 0.08;
        const totalMonths = parseInt(document.getElementById('price-period').value) || 240;
        
        let tableData = [];
        let currentBalance = value;
        
        for (let m = 1; m <= (fullTable ? totalMonths : Math.min(12, totalMonths)); m++) {
            const monthInterest = currentBalance * monthlyInterest;
            const monthAmortization = installment - monthInterest;
            tableData.push([m, 
                `R$ ${installment.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${monthAmortization.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${monthInterest.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, 
                `R$ ${(currentBalance - monthAmortization).toLocaleString('pt-BR',{minimumFractionDigits:2})}`]);
            currentBalance -= monthAmortization;
        }
        
        document.getElementById('resultTitle').textContent = 'Resultado PRICE';
        document.getElementById('resultContent').innerHTML = `
            <div class="result-item"><span class="result-label">Valor da Parcela:</span><span class="result-value">R$ ${installment.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
            <div class="result-item"><span class="result-label">Total de Juros:</span><span class="result-value">R$ ${(installment*totalMonths-value).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>`;
        
        document.getElementById('resultTable').innerHTML = `
            <div class="table-title">Tabela PRICE</div>
            ${generateTable(tableData, ['Mês', 'Parcela', 'Amortização', 'Juros', 'Saldo'])}
            ${totalMonths > 12 && !fullTable ? `<button class="show-more-btn" onclick="fullTable=true;calculatePrice()">Ver Mais</button>` : ''}`;
        
        document.getElementById('formulaInfo').textContent = `Fórmula: PMT = PV × [i/(1 - (1+i)⁻ⁿ)] | Taxa mensal: ${(monthlyInterest*100).toFixed(4)}%`;
        document.getElementById('resultSection').style.display = 'block';
    } catch(e) { alert("Erro no cálculo PRICE: "+e.message); console.error(e); }
}

window.onload = function() {
    document.getElementById('jc-initialValue').placeholder = 'Ex: 1.000,00';
    document.getElementById('jc-interestRate').placeholder = 'Ex: 11,00';
    document.getElementById('sac-value').placeholder = 'Ex: 100.000,00';
    document.getElementById('sac-interest').placeholder = 'Ex: 8,00';
    document.getElementById('price-installment').placeholder = 'Ex: 1.200,00';
};