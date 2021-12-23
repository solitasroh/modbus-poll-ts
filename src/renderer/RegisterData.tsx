import { FormattedData, Endian } from "./PollPage";

export class RegisterData {
  address: number;

  rawBuffer: Buffer;

  length: number;

  data: FormattedData[];

  constructor(address: number, rawData: Buffer) {
    this.address = address;
    this.rawBuffer = rawData;
    this.length = rawData.length >> 1;

    this.data = this.parsing(Endian.Big);
  }

  parsing(endian: Endian): FormattedData[] {
    const wordData = Array(this.length)
      .fill(0)
      .map((_, index): FormattedData => {
        if (endian == Endian.Big) {
          return {
            address: this.address + index,
            int16: this.rawBuffer.readInt16BE(index * 2),
            uint16: this.rawBuffer.readUInt16BE(index * 2),
            hex: `0x${this.rawBuffer
              .readUInt16BE(index * 2)
              .toString(16)
              .padStart(4, "0")
              .toUpperCase()}`,
            float:
              index % 2 == 0
                ? this.rawBuffer.readFloatBE(index * 2).toPrecision(4)
                : "0",
          };
        }

        return {
          address: this.address + index,
          int16: this.rawBuffer.readInt16LE(index * 2),
          uint16: this.rawBuffer.readUInt16LE(index * 2),
          hex: `0x${this.rawBuffer
            .readUInt16LE(index * 2)
            .toString(16)
            .padStart(4, "0")
            .toUpperCase()}`,
          float:
            index % 2 == 0
              ? this.rawBuffer.readFloatLE(index * 2).toPrecision(4)
              : "0",
        };
      });

    return wordData;
  }

  fetchData(address: number): FormattedData {
    return this.data.find((d) => d.address === address);
  }
}
