import { H3_SHEET } from '@/lib/headingSizes';

export type DocxItem =
  | { type: 'p'; text: string; bold: boolean }
  | { type: 'table'; rows: string[][] };

/** Group consecutive items under the nearest preceding bold paragraph. */
export type DocxGroup = { title?: string; items: DocxItem[] };

export function groupDocxItems(items: DocxItem[]): DocxGroup[] {
  const groups: DocxGroup[] = [];
  for (const item of items) {
    if (item.type === 'p' && item.bold) {
      groups.push({ title: item.text, items: [] });
    } else {
      if (groups.length === 0) groups.push({ items: [] });
      groups[groups.length - 1].items.push(item);
    }
  }
  return groups;
}

/** Renders a single item (a non-bold paragraph, or a table). */
export function DocxItemView({ item }: { item: DocxItem }) {
  if (item.type === 'p') {
    if (item.bold) {
      return (
        <h3 className="font-serif font-bold text-[#EAECEF] text-base md:text-lg mt-6 first:mt-0" style={H3_SHEET}>
          {item.text}
        </h3>
      );
    }
    return (
      <p className="text-[#c4c4c4] text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
    );
  }

  const colCount = Math.max(1, ...item.rows.map((r) => r.length));
  return (
    <div className="my-4 border border-[rgba(198,168,248,0.2)] rounded-lg overflow-hidden">
      <table className="w-full">
        <tbody>
          {item.rows.map((row, ri) => (
            <tr key={ri} className={ri > 0 ? 'border-t border-[rgba(198,168,248,0.12)]' : ''}>
              {Array.from({ length: colCount }).map((_, ci) => {
                const cell = row[ci] ?? '';
                return (
                  <td
                    key={ci}
                    className={`p-3 text-sm align-top ${
                      ci === 0 ? 'font-medium text-[#EAECEF]' : 'text-[#c4c4c4]'
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
}

/** Plain sequential rendering of every item (no grouping). */
export function DocxView({ items }: { items: DocxItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <DocxItemView key={i} item={item} />
      ))}
    </div>
  );
}