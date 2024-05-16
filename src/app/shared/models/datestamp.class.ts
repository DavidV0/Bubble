export class Datestamp {

weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

weekday;
day;
month

constructor(obj: Date) {
    this.weekday = this.weekdays[obj.getDay()];
    this.day = obj.getDate();
    this.month = this.months[obj.getMonth()];
}


}