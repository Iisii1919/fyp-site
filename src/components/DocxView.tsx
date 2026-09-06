export type DocxItem =
  | { type: 'p'; text: string; bold: boolean }
  | { type: 'table'; rows: string[][] };

export function DocxView({ items }: { items: DocxItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        if (item.type === 'p') {
          if (item.bold) {
            return (
              <h3
                key={i}
                className="font-serif font-bold text-[#EAECEF] text-base md:text-lg mt-6 first:mt-0"
              >
                {item.text}
              </h3>
            );
          }
          return (
            <p key={i} className="text-[#c4c4c4] text-sm leading-relaxed whitespace-pre-wrap">
              {item.text}
            </p>
          );
        }

        // table
        const colCount = Math.max(1, ...item.rows.map((r) => r.length));
        return (
          <div
            key={i}
            className="my-5 border border-[rgba(198,168,248,0.2)] rounded-lg overflow-hidden"
          >
            <table className="w-full">
              <tbody>
                {item.rows.map((row, ri) => (
                  <tr key={ri} className={ri > 0 ? 'border-t border-[rgba(198,168,248,0.12)]' : ''}>
                    {Array.from({ length: colCount }).map((_, ci) => {
                      const cell = row[ci] ?? '';
                      const isLabel = ci === 0;
                      return (
                        <td
                          key={ci}
                          className={`p-3 text-sm align-top ${
                            isLabel ? 'font-medium text-[#EAECEF]' : 'text-[#c4c4c4]'
                          } ${ci > 0 ? 'border-l border-[rgba(198,168,248,0.12)]' : ''}`}
                        >
                          {cell || <span className="inline-block min-h-[1.5em]">&nbsp;</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}